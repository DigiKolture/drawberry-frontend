import moment from "moment";
export function helpers() {
  const formatDate = (date: string) => {
    return moment(date).format("MMMM DD, YYYY");
  };

  const diffForHumans = (date: string) => {
    return moment(date).fromNow();
  };

  const copyObject = (data: string) => {
    return Object.assign({}, JSON.parse(JSON.stringify(data)));
  };

  const capitalizeFirstLetter = (inputString: string) => {
    return inputString.charAt(0).toUpperCase() + inputString.slice(1);
  };

  const sliceString = (str: string, num = 12) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + "...";
  };

  const isNumeric = (value: any) => {
    return !isNaN(value) && value.trim() !== "";
  };

  const find = (array: any[], key: string, value: any) => {
    return array.find((obj) => obj[key] === value) || null;
  };

  const findIndex = (array: any[], key: string, value: any) => {
    const index = array.findIndex((obj) => obj[key] === value);
    if (index < 0) return null;
    return index;
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

  const isObject = (value: any) => {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  };

  const rejectError = ({ response = null }: { response?: Response | null }) => {
    let message = "Ooops!! something went wrong.";

    if (response && response.data && response.data.message) {
      message = response.data.message;
    }

    return Promise.reject(message);
  };

  const isObjectsMatched = (obj1: any, obj2: any) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (!(key in obj2) || obj1[key] !== obj2[key]) {
        return false;
      }
    }
    return true;
  };

  return {
    find,
    findIndex,
    formatDate,
    isNumeric,
    isValidImageUrl,
    capitalizeFirstLetter,
    copyObject,
    copy,
    isObject,
    sliceString,
    diffForHumans,
    rejectError,
    isObjectsMatched,
  };
}
