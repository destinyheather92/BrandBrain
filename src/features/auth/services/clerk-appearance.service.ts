export function getClerkAppearance() {
  return {
    variables: {
      borderRadius: "0.5rem",
      colorBackground: "#141A26",
      colorDanger: "#EF4444",
      colorInputBackground: "#0B0F19",
      colorInputText: "#F8FAFC",
      colorPrimary: "#00E5FF",
      colorText: "#F8FAFC",
      colorTextSecondary: "#CBD5E1"
    },
    elements: {
      card: "border border-[#263244] bg-[#141A26] shadow-none",
      formButtonPrimary: "bg-[#00E5FF] text-[#0B0F19] hover:bg-[#4CF2FF]",
      footerActionLink: "text-[#00E5FF] hover:text-[#4CF2FF]",
      headerSubtitle: "text-[#CBD5E1]",
      headerTitle: "text-[#F8FAFC]",
      socialButtonsBlockButton: "border-[#263244] bg-transparent text-[#F8FAFC] hover:bg-[#1C2433]",
      socialButtonsBlockButtonText: "text-[#F8FAFC]"
    }
  } as const;
}
