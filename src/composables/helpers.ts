import moment from "moment";
export function helpers() {
  const formatDate = (date: string) => {
    return moment(date).format("MMMM DD, YYYY");
  };

  return {
    formatDate,
  };
}
