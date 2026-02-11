import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const layout = StyleSheet.create({
  // whole screen background
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // use inside ScrollView contentContainerStyle
  content: {
    padding: 14,
    paddingBottom: 30,
  },

  // cards
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },

  // headings
  h1: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
  },
  h2: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  button: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },

  muted: {
    color: colors.textMuted,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },

  pickerWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    overflow: "hidden",
    backgroundColor: colors.inputBg,
  },
});
