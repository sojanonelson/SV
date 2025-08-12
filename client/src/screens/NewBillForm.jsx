import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getParties,
  getProducts,
  createInvoice,
  createParty,
  createProduct,
} from "../services/api";
import { Picker } from "@react-native-picker/picker";
import { Modal, Pressable } from "react-native";

function NewBillForm({ navigation }) {
  const [showPartyPicker, setShowPartyPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  const [parties, setParties] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [useExistingParty, setUseExistingParty] = useState(true);
  const [formData, setFormData] = useState({
    partyId: "",
    tax: 0,
    discount: 0,
    paymentStatus: "unpaid",
    partyName: "",
    partyPhone: "",
    partyPlace: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setSelectedProducts([]);
      try {
        const partiesData = await getParties();
        const productsData = await getProducts();
        setParties(partiesData);
        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

 const calculateItemTotal = (item) => {
  const product = products.find((p) => p._id === item.productId) || item.newProduct;
  if (!product || isNaN(product.price)) return 0;
  
  const itemTotalWithoutDiscount = item.quantity * product.price;
  const discountAmount = (itemTotalWithoutDiscount * (item.discount || 0)) / 100;
  return itemTotalWithoutDiscount - discountAmount;
};

const calculateTotal = () => {
  let subtotal = 0;
  selectedProducts.forEach((item) => {
    subtotal += calculateItemTotal(item);
  });
  
  // Add tax (assuming tax is a percentage)
  const taxAmount = (subtotal * (formData.tax || 0)) / 100;
  return subtotal + taxAmount;
};


const handleReset = async () => {
  setFormData({
    partyId: "",
    tax: 0,
    discount: 0,
    paymentStatus: "unpaid",
    partyName: "",
    partyPhone: "",
    partyPlace: "",
  })

  setCurrentProductIndex(0)
  
  setSelectedProducts([])

}

  const handleAddProduct = () => {
    setSelectedProducts([
      ...selectedProducts,
      {
        productId: "",
        newProduct: null,
        useExistingProduct: true,
        quantity: 1,
        discount: 0,
        name: "",
        weight: "",
        price: "",
        productDiscount: 0,
      },
    ]);
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...selectedProducts];
    if (field === "discount") {
      let discountValue = parseFloat(value) || 0;
      discountValue = Math.min(100, Math.max(0, discountValue)); // Clamp between 0-100
      updatedProducts[index][field] = discountValue;
    } else {
      updatedProducts[index][field] = value;
    }
    setSelectedProducts(updatedProducts);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1);
    setSelectedProducts(updatedProducts);
  };

  const toggleProductType = (index) => {
    const updatedProducts = [...selectedProducts];
    const product = updatedProducts[index];
    product.useExistingProduct = !product.useExistingProduct;
    if (product.useExistingProduct) {
      product.newProduct = null;
    }
    setSelectedProducts(updatedProducts);
  };

  const handleNewProductSubmit = async (index) => {
    setError("");
    setSuccess("");

    const product = selectedProducts[index];
    if (!product.name || !product.weight || !product.price) {
      setError("Please fill in all fields for the new product.");
      return;
    }

    try {
      const newProduct = {
        name: product.name,
        weight: parseFloat(product.weight),
        price: parseFloat(product.price),
        discount: parseFloat(product.productDiscount) || 0,
      };
      const response = await createProduct(newProduct);
      const updatedProducts = [...selectedProducts];
      updatedProducts[index].productId = response._id;
      updatedProducts[index].useExistingProduct = true;
      updatedProducts[index].newProduct = response;
      setProducts([...products, response]);
      setSelectedProducts(updatedProducts);
      setSuccess("New product created successfully!");
    } catch (err) {
      setError(err.message || "Failed to create product");
    }
  };

const handleSubmit = async () => {
  setError("");
  setSuccess("");
  if (useExistingParty && !formData.partyId)
    return setError("Select a party");
  if (!useExistingParty && (!formData.partyName || !formData.partyPhone))
    return setError("Enter party details");
  if (selectedProducts.length === 0)
    return setError("Add at least one product");
  try {
    let partyId = formData.partyId;
    if (!useExistingParty) {
      const partyResponse = await createParty({
        name: formData.partyName,
        phoneNumber: formData.partyPhone,
        place: formData.partyPlace,
      });
      partyId = partyResponse._id;
    }

    // Console.log each product's details for verification
    selectedProducts.forEach((item) => {
      const product = products.find(p => p._id === item.productId) || item.newProduct;
      const price = product?.price || 0;
      const quantity = item.quantity;
      const discountPercentage = item.discount || 0;
      const itemTotalWithoutDiscount = quantity * price;
      const discountAmount = (itemTotalWithoutDiscount * discountPercentage) / 100;
      const itemTotal = itemTotalWithoutDiscount - discountAmount;

      console.log('Product Details:');
      console.log('Name:', product?.name);
      console.log('Quantity:', quantity);
      console.log('Unit Price:', price);
      console.log('Discount Percentage:', discountPercentage + '%');
      console.log('Total Before Discount:', itemTotalWithoutDiscount);
      console.log('Discount Amount:', discountAmount);
      console.log('Final Total:', itemTotal);
      console.log('-------------------');
    });

    const invoiceData = {
      partyId,
      tax: formData.tax,
      paymentStatus: formData.paymentStatus,
      items: selectedProducts.map((item) => {
        const product = products.find(p => p._id === item.productId) || item.newProduct;
        const price = product?.price || 0;
        const quantity = item.quantity;
        const discountPercentage = item.discount || 0;
        const itemTotalWithoutDiscount = quantity * price;
        const discountAmount = (itemTotalWithoutDiscount * discountPercentage) / 100;
        const itemTotal = itemTotalWithoutDiscount - discountAmount;

        return {
          productId: item.productId,
          quantity: quantity,
          discount: discountPercentage,
          price: price,
          name: product?.name || item.name,
          total: itemTotal,
          discountAmount: discountAmount,
          itemTotalWithoutDiscount: itemTotalWithoutDiscount
        };
      }),
      grandTotal: calculateTotal(), // Send the calculated grand total
    };
    
    console.log('Sending to backend:', invoiceData);
    const response = await createInvoice(invoiceData);
    setSuccess("Invoice created successfully!");
    if (response._id)
      navigation.navigate("InvoiceDetail", { id: response._id });
  } catch (err) {
    setError(err.message || "Failed to create invoice");
  }
};
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
     <View style={styles.rowContainer}>
  <Text style={styles.heading}>Create New Bill</Text>

  <TouchableOpacity
    style={styles.radioButton}
    onPress={() => handleReset()}
  >
 <Text style={styles.resetText}>Reset details</Text>
  </TouchableOpacity>

  
</View>

{error && <Text style={styles.errorText}>{error}</Text>}
  {success && <Text style={styles.successText}>{success}</Text>}


      

      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setUseExistingParty(true)}
        >
          <Ionicons
            name={useExistingParty ? "radio-button-on" : "radio-button-off"}
            size={18}
            color="#000"
          />
          <Text style={styles.radioText}>Use Existing Party</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setUseExistingParty(false)}
        >
          <Ionicons
            name={!useExistingParty ? "radio-button-on" : "radio-button-off"}
            size={18}
            color="#000"
          />
          <Text style={styles.radioText}>New Party</Text>
        </TouchableOpacity>
      </View>

      {useExistingParty ? (
        <>
          <Pressable
            style={styles.input}
            onPress={() => setShowPartyPicker(true)}
          >
            <Text>
              {formData.partyId
                ? parties.find((p) => p._id === formData.partyId)?.name ||
                  "Select a party"
                : "Select a party"}
            </Text>
          </Pressable>

          <Modal
            visible={showPartyPicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <ScrollView>
                  <Pressable
                    style={styles.modalItem}
                    onPress={() => {
                      setFormData({ ...formData, partyId: "" });
                      setShowPartyPicker(false);
                    }}
                  >
                    <Text>Select a party</Text>
                  </Pressable>
                  {parties.map((p) => (
                    <Pressable
                      key={p._id}
                      style={styles.modalItem}
                      onPress={() => {
                        setFormData({ ...formData, partyId: p._id });
                        setShowPartyPicker(false);
                      }}
                    >
                      <Text>{`${p.name} (${p.phoneNumber})`}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Pressable
                  style={styles.modalCloseButton}
                  onPress={() => setShowPartyPicker(false)}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <>
          <Text style={styles.label}>Party name</Text>
          <TextInput
            style={styles.input}
            placeholder="Party Name"
            value={formData.partyName}
            onChangeText={(val) => setFormData({ ...formData, partyName: val })}
          />
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone"
            keyboardType="phone-pad"
            value={formData.partyPhone}
            onChangeText={(val) =>
              setFormData({ ...formData, partyPhone: val })
            }
          />
          <Text style={styles.label}>Place</Text>
          <TextInput
            style={styles.input}
            placeholder="Place"
            value={formData.partyPlace}
            onChangeText={(val) =>
              setFormData({ ...formData, partyPlace: val })
            }
          />
        </>
      )}

      <Text style={styles.label}>Payment Status</Text>
      <Pressable style={styles.input} onPress={() => setShowStatusPicker(true)}>
        <Text>{formData.paymentStatus === "unpaid" ? "Unpaid" : "Paid"}</Text>
      </Pressable>

      <Modal
        visible={showStatusPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Pressable
              style={styles.modalItem}
              onPress={() => {
                setFormData({ ...formData, paymentStatus: "unpaid" });
                setShowStatusPicker(false);
              }}
            >
              <Text>Unpaid</Text>
            </Pressable>
            <Pressable
              style={styles.modalItem}
              onPress={() => {
                setFormData({ ...formData, paymentStatus: "paid" });
                setShowStatusPicker(false);
              }}
            >
              <Text>Paid</Text>
            </Pressable>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setShowStatusPicker(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.productsHeader}>
        <Text style={styles.productsTitle}>Products</Text>
        <TouchableOpacity onPress={handleAddProduct} style={styles.addButton}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {selectedProducts.map((product, index) => {
        const productData = products.find(p => p._id === product.productId) || product.newProduct;
        const itemTotal = calculateItemTotal(product);
        
        return (
          <View key={index} style={styles.productItem}>
            <View style={styles.productHeader}>
              <Text style={styles.productNumber}>{index + 1}.</Text>
              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => toggleProductType(index)}
              >
                <Text>
                  {product.useExistingProduct
                    ? "Select Existing Product"
                    : "Add New Product"}
                </Text>
              </TouchableOpacity>
            </View>

            {product.useExistingProduct ? (
              <>
                <Pressable
                  style={styles.input}
                  onPress={() => {
                    setCurrentProductIndex(index);
                    setShowProductPicker(true);
                  }}
                >
                  <Text>
                    {product.productId
                      ? products.find((p) => p._id === product.productId)?.name ||
                        "Select Product"
                      : "Select Product"}
                  </Text>
                </Pressable>

                <Modal
                  visible={showProductPicker && currentProductIndex === index}
                  transparent={true}
                  animationType="slide"
                >
                  <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                      <ScrollView>
                        <Pressable
                          style={styles.modalItem}
                          onPress={() => {
                            handleProductChange(index, "productId", "");
                            setShowProductPicker(false);
                          }}
                        >
                          <Text>Select Product</Text>
                        </Pressable>
                        {products.map((p) => (
                          <Pressable
                            key={p._id}
                            style={styles.modalItem}
                            onPress={() => {
                              handleProductChange(index, "productId", p._id);
                              setShowProductPicker(false);
                            }}
                          >
                            <Text>{`${p.name} - ₹${p.price}`}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                      <Pressable
                        style={styles.modalCloseButton}
                        onPress={() => setShowProductPicker(false)}
                      >
                        <Text style={styles.modalCloseText}>Close</Text>
                      </Pressable>
                    </View>
                  </View>
                </Modal>
              </>
            ) : (
              <>
              <Text style={styles.label}>Product name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Product Name"
                  value={product.name}
                  onChangeText={(val) => handleProductChange(index, "name", val)}
                />
                <Text style={styles.label}>Product weight</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Weight"
                  keyboardType="numeric"
                  value={product.weight}
                  onChangeText={(val) =>
                    handleProductChange(index, "weight", val)
                  }
                />
                <Text style={styles.label}>Product Price</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  keyboardType="numeric"
                  value={product.price}
                  onChangeText={(val) => handleProductChange(index, "price", val)}
                />
                {/* <TextInput
                  style={styles.input}
                  placeholder="Product Discount"
                  keyboardType="numeric"
                  value={product.productDiscount.toString()}
                  onChangeText={(val) =>
                    handleProductChange(
                      index,
                      "productDiscount",
                      parseFloat(val) || 0
                    )
                  }
                /> */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => handleNewProductSubmit(index)}
                >
                  <Text style={styles.submitButtonText}>Save New Product</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.row}>
              <View style={styles.card}>
                <Text>Quantity:</Text>
                <TextInput
                  style={[styles.input]}
                  placeholder="Qty"
                  keyboardType="numeric"
                  value={product.quantity.toString()}
                  onChangeText={(val) =>
                    handleProductChange(index, "quantity", parseInt(val) || 0)
                  }
                />
              </View>
              <View style={styles.card}>
                <Text>Discount (%):</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Discount %"
                  keyboardType="numeric"
                  value={product.discount.toString()}
                  onChangeText={(val) => handleProductChange(index, 'discount', parseFloat(val) || 0)}
                />
              </View>
              <View style={styles.card}>
                <Text>Item Total:</Text>
                <Text style={styles.totalText}>₹{itemTotal.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleRemoveProduct(index)}
              >
                <Ionicons name="trash" size={20} color="#f00" />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <Text style={styles.totalText}>
        Total: ₹{calculateTotal().toFixed(2)}
      </Text>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Create Invoice</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000",
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    color:'#000',
    borderRadius: 4,
  },
  label: {
    marginBottom: 6,
    fontWeight: "500",
    color: "#000",
  },
  radioGroup: {
    flexDirection: "row",
    marginBottom: 16,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  radioText: {
    marginLeft: 6,
    fontSize: 16,
    color: "#000",
  },
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#000",
    padding: 8,
    alignItems: "center",
    borderRadius: 4,
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 6,
  },
  productItem: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    padding: 10,
    marginBottom: 12,
    borderRadius: 4,
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  productNumber: {
    fontWeight: "bold",
    marginRight: 8,
    color: "#000",
  },
  totalText: {
    textAlign: "right",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 20,
    color: "#000",
  },
  submitButton: {
    backgroundColor: "#000",
    padding: 12,
    marginTop: 8,
    marginBottom: 20,
    alignItems: "center",
    borderRadius: 4,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#f00",
    textAlign: "center",
    marginBottom: 12,
  },
  successText: {
    color: "#0a0",
    textAlign: "center",
    marginBottom: 12,
  },
  switchButton: {
    backgroundColor: "#eee",
    padding: 8,
    alignItems: "center",
    borderRadius: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    flexDirection: "column",
    width: "22%",
  },
  deleteButton: {
    width: "10%",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    width: "80%",
    maxHeight: "60%",
    borderRadius: 8,
    padding: 16,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalCloseButton: {
    padding: 16,
    backgroundColor: "#000",
    borderRadius: 4,
    marginTop: 16,
    alignItems: "center",
  },
  modalCloseText: {
    color: "white",
    fontWeight: "bold",
  },
  rowContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between' // optional, spreads them out
},
 resetText:{
    color: "red",
    fontWeight: "bold",
  },

});

export default NewBillForm;