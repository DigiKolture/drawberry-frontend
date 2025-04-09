import html2canvas, { Options as Html2CanvasOptions } from "html2canvas";

export function useImageCapture() {
  /**
   * Captures a DOM element as an image and downloads it
   * @param element - The DOM element to capture
   * @param filename - The download filename
   * @param options - Options for html2canvas
   * @returns Promise resolving to the image data URL if successful
   */
  const captureAndDownloadElement = async (
    element: HTMLElement | null,
    filename = "snapshot.png",
    options: Partial<Html2CanvasOptions> = {}
  ): Promise<string | undefined> => {
    if (!element) {
      console.error("No element provided for capture");
      return;
    }

    try {
      // Default options merged with provided options
      const defaultOptions: Partial<Html2CanvasOptions> = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      };

      const canvas = await html2canvas(element, {
        ...defaultOptions,
        ...options,
      });
      const dataUrl = canvas.toDataURL("image/png");
      downloadImage(dataUrl, filename);

      return dataUrl;
    } catch (error) {
      console.error("Error capturing element:", error);
      return undefined;
    }
  };

  /**
   * Downloads an image from a data URL
   * @param dataUrl - The data URL of the image
   * @param filename - The download filename
   */
  const downloadImage = (dataUrl: string, filename: string): void => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    captureAndDownloadElement,
    downloadImage,
  };
}
