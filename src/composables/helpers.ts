import moment from "moment";
export function helpers() {
  const formatDate = (date: string) => {
    return moment(date).format("MMMM DD, YYYY");
  };

  const diffForHumans = (date: string) => {
    return moment(date).fromNow();
  };

  const capitalizeFirstLetter = (inputString: string) => {
    return inputString.charAt(0).toUpperCase() + inputString.slice(1);
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

  const copy = (text: string) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);

    const selection = document.getSelection();
    if (selection) {
      const selected =
        selection.rangeCount > 0 ? selection.getRangeAt(0) : false;

      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);

      if (selected) {
        selection.removeAllRanges();
        selection.addRange(selected);
      }
    }
  };

  interface ResponseData {
    message?: string;
  }

  interface Response {
    data?: ResponseData;
  }

  const rejectError = ({ response = null }: { response?: Response | null }) => {
    let message = "Ooops!! something went wrong.";

    if (response && response.data && response.data.message) {
      message = response.data.message;
    }

    return Promise.reject(message);
  };

  return {
    formatDate,
    isValidImageUrl,
    capitalizeFirstLetter,
    copy,
    sliceString,
    diffForHumans,
    rejectError,
  };
}
