import { Disease } from "./diseasePredictor";
import { MedicineSafety } from "./safetyChecker";

export interface ShareableData {
  diseases: Disease[];
  safetyResults: MedicineSafety[];
  symptoms: string[];
  allergies: string[];
  currentMedications: string[];
  date: string;
}

export async function shareReport(data: ShareableData): Promise<void> {
  const shareText = generateShareText(data);
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Medical Assessment Report",
        text: shareText,
      });
    } catch (error: any) {
      if (error.name !== "AbortError") {
        // Fallback to clipboard
        await copyToClipboard(shareText);
      }
    }
  } else {
    // Fallback to clipboard
    await copyToClipboard(shareText);
  }
}

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
}

function generateShareText(data: ShareableData): string {
  const topDisease = data.diseases[0];
  const safeMeds = data.safetyResults.filter(m => m.isSafe);
  
  let text = `🩺 Medical Assessment Report\n`;
  text += `Date: ${data.date}\n\n`;
  
  text += `Primary Condition: ${topDisease.name} (${topDisease.confidence}% confidence)\n\n`;
  
  text += `Symptoms:\n${data.symptoms.map(s => `• ${s}`).join('\n')}\n\n`;
  
  if (data.allergies.length > 0) {
    text += `Allergies:\n${data.allergies.map(a => `• ${a}`).join('\n')}\n\n`;
  }
  
  if (data.currentMedications.length > 0) {
    text += `Current Medications:\n${data.currentMedications.map(m => `• ${m}`).join('\n')}\n\n`;
  }
  
  if (safeMeds.length > 0) {
    text += `Recommended Medications:\n${safeMeds.map(m => `• ${m.medicine} - ${m.category}`).join('\n')}\n\n`;
  }
  
  text += `⚠️ Disclaimer: This is for educational purposes only. Always consult a healthcare professional.`;
  
  return text;
}

export function generateShareableLink(data: ShareableData): string {
  // In a real app, you'd save this to a database and generate a shareable link
  // For now, we'll encode it in the URL (not recommended for production with sensitive data)
  const encoded = btoa(JSON.stringify(data));
  return `${window.location.origin}/share/${encoded}`;
}

