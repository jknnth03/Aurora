import moment from "moment";
import { useEffect, useState } from "react";

export const useClock = () => {
  const [timeIn, setTimeIn] = useState(moment().format("hh:mm:ss A"));
  const [date, setDate] = useState(moment().format("dddd, MMMM D, YYYY"));

  return { timeIn, setTimeIn, date };
};
