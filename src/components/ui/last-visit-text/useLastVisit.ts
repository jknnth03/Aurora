import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import moment from "moment";
import { getCookie, setCookie } from "../../../utils/cookie";

type UseLastVisitReturn = {
  lastVisit: string;
  triggerUpdate: () => void;
  createVisit: () => void;
};

export type { UseLastVisitReturn };

export const useLastVisit = (path: string): UseLastVisitReturn => {
  const [lastVisitUpdate, setLastVisitUpdate] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const lastVisit = useMemo(() => {
    const cookieValue = getCookie("last-visit" + path);
    if (!cookieValue) return "";

    let parsedDate = moment(cookieValue, moment.ISO_8601, true);

    if (!parsedDate.isValid()) {
      parsedDate = moment(new Date(cookieValue));
    }

    return parsedDate.isValid() ? parsedDate.fromNow() : "";
  }, [path, lastVisitUpdate]);

  useEffect(() => {
    const cookieValue = getCookie("last-visit" + path);

    if (cookieValue) {
      intervalRef.current = setInterval(() => {
        setLastVisitUpdate(moment().valueOf());
      }, 30000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [path]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const triggerUpdate = useCallback(() => {
    setLastVisitUpdate(moment().valueOf());
  }, []);

  const createVisit = useCallback(() => {
    setCookie("last-visit" + path, moment().toISOString());
    setLastVisitUpdate(moment().valueOf());
  }, [path]);

  return {
    lastVisit,
    triggerUpdate,
    createVisit,
  };
};
