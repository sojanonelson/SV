import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { getInvoice, getCompany } from "../services/api";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { uploadPdf } from "../services/cloudinaryService";
import * as ImageManipulator from 'expo-image-manipulator';
import QRCODE from '../../assets/QR_Code.png';
import { Asset } from 'expo-asset';

function ProfessionalInvoice({ navigation, route }) {
  const [company, setCompany] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
   const [qrCodeBase64, setQrCodeBase64] = useState('');
  const { id } = route.params;
  const invoiceRef = useRef();
useEffect(() => {
  const fetchData = async () => {
    try {
      // Get invoice data
      const invoiceData = await getInvoice(id);
      console.log(invoiceData);
      setInvoice(invoiceData);

      // Get company data
      const companyData = await getCompany();
      setCompany(companyData);

      // Load QR code as Base64
      async function getBase64Qr() {
        const asset = Asset.fromModule(require('../../assets/QR_Code.png'));
        await asset.downloadAsync(); // makes sure it's local
        const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setQrCodeBase64(`data:image/png;base64,${base64}`);
      }

      await getBase64Qr(); // ✅ actually call it here

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
      Alert.alert("Error", "Failed to load invoice data");
    }
  };

  fetchData();
}, [id]);



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const generateHtml = () => {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 20px; }
            .details-container { display: flex; border: 1px solid #ddd; margin-bottom: 20px; }
            .customer-details, .invoice-details { flex: 1; padding: 10px; }
            .customer-details { border-right: 1px solid #ddd; }
            .section-header { background-color: #eee; padding: 8px; font-weight: bold; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .table th { background-color: #eee; padding: 8px; text-align: center; font-weight: bold; }
            .table td { padding: 8px; border-bottom: 1px solid #ddd; text-align: center; }
            .totals { margin-top: 20px; }
            .totals-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .terms { margin-top: 20px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>${company.ownerName}</h2>
              <p>Phone: ${company.phoneNumber}</p>
              <p>Email: ${company.email}</p>
            </div>
            <div>
              <p>FSSAI: ${company.fssaiNumber}</p>
              <p>GST: ${company.gstNumber}</p>
            </div>
          </div>

          <h2 class="title">Bill of Supply</h2>

          <div class="details-container">
            <div class="customer-details">
              <div class="section-header">Bill To:</div>
              <p><strong>${invoice.partyName}</strong></p>
              <p>Phone: ${invoice.partyPhone}</p>
              ${
                invoice.partyId?.place
                  ? `<p>Address: ${invoice.partyId.place}</p>`
                  : ""
              }
            </div>
            <div class="invoice-details">
              <div class="section-header">Invoice Details:</div>
              <p>Invoice ID: ${invoice.invoiceNumber}</p>
              <p>Invoice Date: ${formatDate(invoice.createdAt)}</p>
              <p>Payment Status: ${invoice.paymentStatus}</p>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Per Unit</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
                .map(
                  (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price / item.quantity)}</td>
                  <td>${formatCurrency(item.price)}</td>
                  <td>${item.discount || 0}%</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="totals">
           
            ${
              invoice.tax > 0
                ? `
              <div class="totals-row">
                <span>Tax (${invoice.taxRate || 18}%):</span>
                <span>${formatCurrency(invoice.tax)}</span>
              </div>
            `
                : ""
            }
            ${
              invoice.discount > 0
                ? `
              <div class="totals-row">
                <span>Discount:</span>
                <span>-${formatCurrency(invoice.discount)}</span>
              </div>
            `
                : ""
            }
            <div class="totals-row">
              <span><strong>Total:</strong></span>
              <span><strong>${formatCurrency(invoice.total)}</strong></span>
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end; align-items:center; gap:8px; margin-top:10px;">
          <div style="displau:flex; flex-direction:column; justify-content:center; align-items:center;">
            <p style="font-size:12px; color:#333;">Scan QR code to pay</p>
  <img src="${qrCodeBase64}" style="width:70px; height:70px;"></div>

</div>




          <div class="terms">
            <p><strong>Terms and Conditions:</strong></p>
            <p>Thank you for your business! We appreciate your trust and look forward to serving you again.</p>
          </div>

          <div class="footer">
            <p>Generated by SV Billing App</p>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    try {
      const html = generateHtml();
      await Print.printAsync({
        html,
        orientation: "portrait",
      });
    } catch (error) {
      console.error("Error printing:", error);
      Alert.alert("Error", "Failed to print invoice. Please try again.");
    }
  };

  const handleDownloadPDF = async () => {
    if (pdfGenerating) return;

    setPdfGenerating(true);
    try {
      const html = generateHtml();
      const { uri } = await Print.printToFileAsync({
        html,
        orientation: "portrait",
      });

      const newUri = `${FileSystem.documentDirectory}invoice_${invoice.invoiceNumber}.pdf`;
      await FileSystem.copyAsync({
        from: uri,
        to: newUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri, {
          mimeType: "application/pdf",
          dialogTitle: "Save Invoice PDF",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert(
          "Success",
          "PDF generated but sharing not available on this device"
        );
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleSendSMS = async () => {
    console.log("Started...");
    try {
      setPdfGenerating(true);

      // 1. Generate PDF from HTML
      const html = generateHtml();
      const { uri } = await Print.printToFileAsync({
        html,
        orientation: "portrait",
      });

      // 2. Convert local URI to file object for FormData
      const file = {
        uri,
        type: "application/pdf",
        name: `invoice_${invoice.invoiceNumber}.pdf`,
      };

      // 3. Upload PDF to Cloudinary
      const uploadToCloud = await uploadPdf(file);
      const cloudinaryUrl = uploadToCloud.url;

      console.log("Uploaded PDF URL:", cloudinaryUrl);

      // 4. Prepare SMS
      const timeOfDay = new Date().getHours() < 12 ? "morning" : "afternoon";
      const smsMessage = `👋 Hello ${invoice.partyName}, good ${timeOfDay}! 🕒 Here's your invoice #${invoice.invoiceNumber} 🧾. 📥 Download: ${cloudinaryUrl}`;

      // 5. Launch SMS app with pre-filled message
      const smsUrl = `sms:${invoice.partyPhone}?body=${encodeURIComponent(
        smsMessage
      )}`;

      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
      } else {
        Alert.alert("Error", "Cannot open SMS app on this device");
      }
    } catch (error) {
      console.error("SMS sending error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to send SMS. Please try again."
      );
    } finally {
      setPdfGenerating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading invoice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!company || !invoice) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No invoice data available</Text>
          <TouchableOpacity
            style={styles.backButtonFull}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#3b82f6" />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.innerContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#3b82f6" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Invoice #{invoice.invoiceNumber}
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.menuButton,
                  pdfGenerating && styles.disabledButton,
                ]}
                onPress={() => handleDownloadPDF()}
                disabled={pdfGenerating}
              >
                <FontAwesome name="whatsapp" size={24} color="#25D366" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.smsButton,
                  pdfGenerating && styles.disabledButton,
                ]}
                onPress={handleSendSMS}
                disabled={pdfGenerating}
              >
                {pdfGenerating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <MaterialIcons name="sms" size={24} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Modal
            visible={menuVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setMenuVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setMenuVisible(false);
                    handlePrint();
                  }}
                >
                  <Text style={styles.modalButtonText}>Print</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setMenuVisible(false);
                    handleDownloadPDF();
                  }}
                >
                  <Text style={styles.modalButtonText}>Download PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setMenuVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View ref={invoiceRef} style={styles.invoiceContainer}>
            <Text style={styles.title}>Bill of Supply</Text>
            <View style={styles.header}>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{company.ownerName}</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="call" size={16} color="black" />
                  <Text style={styles.infoText}>{company.phoneNumber}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="mail" size={16} color="black" />
                  <Text style={styles.infoText}>{company.email}</Text>
                </View>
              </View>
              <View style={styles.companyInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>FSSAI:</Text>
                  <Text style={styles.infoText}>{company.fssaiNumber}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>GST:</Text>
                  <Text style={styles.infoText}>{company.gstNumber}</Text>
                </View>
              </View>
            </View>
            <View style={styles.detailsContainer}>
              <View style={styles.customerDetails}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>Bill To:</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailTextBold}>{invoice.partyName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="call" size={16} color="black" />
                  <Text style={styles.detailText}>{invoice.partyPhone}</Text>
                </View>
                {invoice.partyId?.place && (
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={16} color="black" />
                    <Text style={styles.detailText}>
                      {invoice.partyId.place}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.invoiceDetails}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>Invoice Details:</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailText}>
                    Invoice ID: {invoice.invoiceNumber}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailText}>
                    Invoice Date: {formatDate(invoice.createdAt)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailText}>
                    Payment Status: {invoice.paymentStatus}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.itemsTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>S.No</Text>
                <Text style={styles.tableHeaderText}>Item</Text>
                <Text style={styles.tableHeaderText}>Qty</Text>
                <Text style={styles.tableHeaderText}>Per Unit</Text>
                <Text style={styles.tableHeaderText}>Price</Text>
                <Text style={styles.tableHeaderText}>Discount</Text>
                <Text style={styles.tableHeaderText}>Total</Text>
              </View>
              {invoice.items.map((item, index) => (
                <View key={item._id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{index + 1}</Text>
                  <Text style={styles.tableCell}>{item.name}</Text>
                  <Text style={styles.tableCell}>{item.quantity}</Text>
                  <Text style={styles.tableCell}>
                    {formatCurrency(item.price / item.quantity)}
                  </Text>
                  <Text style={styles.tableCell}>
                    {formatCurrency(item.price)}
                  </Text>
                  <Text style={styles.tableCell}>{item.discount || 0}%</Text>
                  <Text style={styles.tableCell}>
                    {formatCurrency(item.total)}
                  </Text>
                </View>
              ))}
              
            </View>
            <View style={styles.totalsContainer}>
              {/* <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Subtotal:</Text>
                <Text style={styles.totalsValue}>
                  {formatCurrency(invoice.subtotal)}
                </Text>
              </View> */}
              {invoice.tax > 0 && (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>
                    Tax ({invoice.taxRate || 18}%):
                  </Text>
                  <Text style={styles.totalsValue}>
                    {formatCurrency(invoice.tax)}
                  </Text>
                </View>
              )}
              {invoice.discount > 0 && (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Discount:</Text>
                  <Text style={styles.totalsValueRed}>
                    -{formatCurrency(invoice.discount)}
                  </Text>
                </View>
              )}
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabelBold}>Total:</Text>
                <Text style={styles.totalsValueBold}>
                  {formatCurrency(invoice.total)}
                </Text>
              </View>
            </View>
            <View style={styles.QRcontainer}>
               <Image  source={QRCODE} style={styles.QR_Code} />

            </View>
           
            <View style={styles.termsContainer}>
              <Text style={styles.termsTitle}>Terms and Conditions:</Text>
              <Text style={styles.termsText}>
                Thank you for your business! We appreciate your trust and look
                forward to serving you again..
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f4ff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f0f4ff",
  },
  innerContainer: {
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#374151",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#ef4444",
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonFull: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    marginLeft: 8,
    color: "#3b82f6",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
    textAlign: "center",
  },
  menuButton: {
    backgroundColor: "#e0f2fe",
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  smsButton: {
    backgroundColor: "#dd1414",
    padding: 10,
    borderRadius: 8,
    minWidth: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  smsButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalButton: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#3b82f6",
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ef4444",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  invoiceContainer: {
    backgroundColor: "white",
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  companyInfo: {
    flex: 1,
    padding: 8,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4b5563",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: "bold",
    marginRight: 8,
    color: "#4b5563",
  },
  infoText: {
    color: "#4b5563",
  },
  detailsContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  customerDetails: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  invoiceDetails: {
    flex: 1,
    padding: 8,
  },
  sectionHeader: {
    backgroundColor: "#e2e8f0",
    padding: 8,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontWeight: "bold",
    color: "#4b5563",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    color: "#4b5563",
    marginLeft: 8,
  },
  detailTextBold: {
    fontWeight: "bold",
    color: "#4b5563",
  },
  itemsTable: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    padding: 10,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: "bold",
    color: "#4b5563",
    textAlign: "center",
    fontSize: 12,
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    color: "#4b5563",
    fontSize: 12,
  },
  totalsContainer: {
    paddingTop:16,
    paddingRight:10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalsLabel: {
    color: "#4b5563",
  },
  totalsValue: {
    fontWeight: "bold",
    color: "#4b5563",
  },
  totalsValueRed: {
    fontWeight: "bold",
    color: "#ef4444",
  },
  totalsLabelBold: {
    fontWeight: "bold",
    color: "#4b5563",
  },
  totalsValueBold: {
    fontWeight: "bold",
    color: "#3b82f6",
    fontSize: 16,
  },
  termsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  termsTitle: {
    fontWeight: "bold",
    color: "#4b5563",
    marginBottom: 8,
  },
  termsText: {
    color: "#4b5563",
  },
  disabledButton: {
    opacity: 0.5,
  },QRcontainer: {
  flexDirection: 'row',
  justifyContent: 'flex-end', // pushes content to the right
  alignItems: 'center', // optional, centers vertically

  padding:5
},

QR_Code: {
  width: 60,
  height: 60,
}
});

export default ProfessionalInvoice;
