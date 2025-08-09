// App.js
import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, Linking, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';

export default function Test() {
  const [loading, setLoading] = useState(false);
  const [driveLink, setDriveLink] = useState('');

  const generatePdfAndSend = async () => {
    try {
      setLoading(true);
      const html = `
        <html>
          <body>
            <h1 style="color: navy;">Hello Soja! ✌️</h1>
            <p>This is your test invoice PDF created using Expo Print!</p>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      const fileBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

      const response = await fetch('http://192.168.119.114:5000/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: `Invoice_${Date.now()}.pdf`,
          file: fileBase64,
        }),
      });

      const data = await response.json();
      if (data.url) {
        console.log("URL:", data.url)
        setDriveLink(data.url);
      } else {
        throw new Error('No URL returned');
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>PDF to Google Drive</Text>
      {loading ? <ActivityIndicator size="large" /> : (
        <Button title="Generate & Upload PDF" onPress={generatePdfAndSend} />
      )}
      {driveLink ? (
        <Text
          style={{ color: 'blue', marginTop: 20 }}
          onPress={() => Linking.openURL(driveLink)}
        >
          View PDF in Google Drive
        </Text>
      ) : null}
    </View>
  );
}
