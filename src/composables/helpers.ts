import moment from "moment";
export function helpers() {
  const formatDate = (date: string) => {
    return moment(date).format("MMMM DD, YYYY");
  };

  const sliceString = (str: string, num = 12) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + "...";
  };

  return {
    formatDate,
    sliceString,
  };
}
