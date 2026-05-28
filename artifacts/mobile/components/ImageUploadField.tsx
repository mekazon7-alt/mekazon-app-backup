/**
 * ImageUploadField — admin-only image upload + preview component.
 *
 * Drop this into any admin form to replace image key pickers.
 * Pass imageKey (e.g. "basket:{id}", "meal:{id}", "hero:{country}").
 * The image is saved to imageStore and immediately visible in the app.
 */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useImageStore } from "@/context/ImageStoreContext";

const C = {
  bg: "#0F1410",
  surface: "#1A2016",
  border: "#2A3424",
  primary: "#4E7234",
  muted: "#728054",
  danger: "#C44040",
  text: "#E8F0DC",
};

interface Props {
  imageKey: string;
  aspectRatio?: [number, number];
}

export function ImageUploadField({ imageKey, aspectRatio = [16, 9] }: Props) {
  const { uriMap, storeImage, removeImage } = useImageStore();
  const [picking, setPicking] = useState(false);

  const storedUri = uriMap[imageKey] ?? null;

  const pick = async () => {
    setPicking(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow access to your photo library to upload images."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        allowsEditing: true,
        aspect: aspectRatio,
      });
      if (!result.canceled && result.assets[0]) {
        await storeImage(imageKey, result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert("Upload failed", "Could not save the image. Please try again.");
    } finally {
      setPicking(false);
    }
  };

  const confirmRemove = () => {
    Alert.alert(
      "Remove uploaded image?",
      "The built-in fallback image will be shown instead.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeImage(imageKey),
        },
      ]
    );
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Image</Text>

      {storedUri ? (
        <View style={styles.previewWrap}>
          <Image
            source={{ uri: storedUri }}
            style={styles.preview}
            contentFit="cover"
          />
          <View style={styles.previewActions}>
            <Pressable
              style={[styles.actionBtn, styles.replaceBtn]}
              onPress={pick}
              disabled={picking}
            >
              {picking ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="image-outline" size={14} color="#FFF" />
                  <Text style={styles.replaceBtnText}>Replace image</Text>
                </>
              )}
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={confirmRemove}
            >
              <Ionicons name="trash-outline" size={14} color={C.danger} />
            </Pressable>
          </View>
          <View style={styles.savedBar}>
            <Ionicons name="checkmark-circle" size={12} color={C.primary} />
            <Text style={styles.savedText}>Custom image — appears in app immediately</Text>
          </View>
        </View>
      ) : (
        <Pressable style={styles.uploadBtn} onPress={pick} disabled={picking}>
          {picking ? (
            <ActivityIndicator size="small" color={C.primary} />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={26} color={C.primary} />
              <Text style={styles.uploadTitle}>Upload from device</Text>
              <Text style={styles.uploadSub}>
                JPEG or PNG · {aspectRatio[0]}:{aspectRatio[1]} crop
              </Text>
            </>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  uploadBtn: {
    borderWidth: 1.5,
    borderColor: C.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 26,
    alignItems: "center",
    gap: 7,
    backgroundColor: C.primary + "14",
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.primary,
  },
  uploadSub: {
    fontSize: 11,
    color: C.muted,
  },
  previewWrap: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
  },
  preview: {
    width: "100%",
    height: 145,
  },
  previewActions: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    backgroundColor: C.surface,
    alignItems: "center",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
  },
  replaceBtn: {
    flex: 1,
    backgroundColor: C.primary,
  },
  deleteBtn: {
    width: 38,
    backgroundColor: C.danger + "22",
  },
  replaceBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFF",
  },
  savedBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    justifyContent: "center",
    paddingVertical: 7,
    backgroundColor: C.bg,
  },
  savedText: {
    fontSize: 11,
    color: C.muted,
  },
});
