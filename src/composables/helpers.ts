import moment from "moment";
export function helpers() {
  const formatDate = (date: string) => {
    return moment(date).format("MMMM DD, YYYY");
  };

  const sliceString = (str: string, num = 12) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + "...";
  };

  const isValidImageUrl = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = function () {
        // Image loaded successfully, URL is valid
        resolve(true);
      };

      img.onerror = function () {
        // Error occurred while loading the image, URL is not valid
        resolve(false);
      };

      img.src = url;
    });
  };

  return {
    formatDate,
    isValidImageUrl,
    sliceString,
  };
}
