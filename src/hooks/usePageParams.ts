import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { RootState } from "../app/store";
import {
  clearPageState,
  PageStateParams,
  resetAllParams,
  setPageState,
  updatePageState,
} from "../features/slices/page-params";
import { useRememberQueryParams } from "../hooks/useRememberQueryParams";
import { setCookie } from "../utils/cookie";
import { toQueryString } from "../utils/toQueryString";

type UrlParamValue = string | number | boolean | null | undefined;

export const usePageParams = <T extends PageStateParams>(
  options: {
    defaultParams?: Partial<T>;
    syncWithUrl?: boolean;
    customPath?: string;
    excludeFromUrl?: Array<keyof T>;
  } = {},
) => {
  const {
    defaultParams = {} as Partial<T>,
    syncWithUrl = true,
    customPath,
    excludeFromUrl = [],
  } = options;

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentParams } = useRememberQueryParams();

  const currentPath = customPath || location.pathname;

  const allPageParams = useSelector(
    (state: RootState) => state.pageParams.pages || {},
  );
  const pageOrder = useSelector(
    (state: RootState) => state.pageParams.pageOrder || [],
  );

  const currentPageParams = useMemo(() => {
    return {
      ...defaultParams,
      ...((allPageParams[currentPath] as Partial<T>) || {}),
    } as T;
  }, [allPageParams, currentPath, defaultParams]);

  useEffect(() => {
    const currentQueryParamsToSave = currentParams;
    const currentPathForCleanup = currentPath;
    setCookie("last-visit" + currentPath, new Date().toString());
    if (syncWithUrl) {
      const hasChanges = Object.keys(currentParams).some(
        (key) => currentPageParams[key as keyof T] !== currentParams[key],
      );

      if (hasChanges) {
        dispatch(
          updatePageState({
            pageName: currentPath,
            params: currentParams as PageStateParams,
          }),
        );
      }
    }

    return () => {
      if (
        Object.keys(currentQueryParamsToSave).length > 0 &&
        !location.pathname.startsWith(currentPathForCleanup)
      ) {
        dispatch(
          setPageState({
            pageName: currentPathForCleanup,
            params: currentQueryParamsToSave,
          }),
        );
      }
    };
  }, [currentPath, syncWithUrl, currentParams, dispatch, location.pathname]);

  const sanitizeParams = <V extends UrlParamValue>(
    params: Record<string, V>,
  ): Record<string, string> => {
    return Object.entries(params).reduce((acc, [key, value]) => {
      if (value === undefined || value === null) return acc;

      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>);
  };

  const excludeKeys = <P extends object>(
    obj: P,
    keysToExclude: Array<keyof P>,
  ): P => {
    const result = { ...obj };

    for (const key of keysToExclude) {
      delete result[key];
    }

    return result;
  };

  const getQueryStringForPath = useCallback(
    (path: string): string => {
      const pathParams = allPageParams[path] || {};
      const sanitizedParams = sanitizeParams(pathParams);
      return toQueryString(sanitizedParams);
    },
    [allPageParams],
  );

  const setParams = useCallback(
    (params: T) => {
      dispatch(
        setPageState({
          pageName: currentPath,
          params: params as PageStateParams,
        }),
      );

      if (syncWithUrl) {
        const filteredParams = excludeKeys(params, excludeFromUrl);
        const sanitizedParams = sanitizeParams(filteredParams);

        const queryString = toQueryString(sanitizedParams);
        navigate(`${currentPath}${queryString}`, { replace: true });
      }
    },
    [dispatch, currentPath, navigate, syncWithUrl, excludeFromUrl],
  );

  const updateParams = useCallback(
    (params: Partial<T>) => {
      dispatch(
        updatePageState({
          pageName: currentPath,
          params: params as PageStateParams,
        }),
      );

      if (syncWithUrl) {
        const mergedParams = { ...currentPageParams, ...params };
        const filteredParams = excludeKeys(mergedParams, excludeFromUrl);
        const sanitizedParams = sanitizeParams(filteredParams);

        const queryString = toQueryString(sanitizedParams);
        navigate(`${currentPath}${queryString}`, { replace: true });
      }
    },
    [
      dispatch,
      currentPath,
      navigate,
      currentPageParams,
      syncWithUrl,
      excludeFromUrl,
    ],
  );

  const clearParams = useCallback(() => {
    dispatch(clearPageState({ pageName: currentPath }));

    if (syncWithUrl) {
      navigate(currentPath, { replace: true });
    }
  }, [dispatch, currentPath, navigate, syncWithUrl]);

  const reset = useCallback(() => {
    dispatch(resetAllParams());

    if (syncWithUrl) {
      navigate(currentPath, { replace: true });
    }
  }, [dispatch, currentPath, navigate, syncWithUrl]);

  const getParam = useCallback(
    <K extends keyof T>(key: K): T[K] => {
      return currentPageParams[key];
    },
    [currentPageParams],
  );

  const setParam = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      const partialParams = {} as Partial<T>;
      partialParams[key] = value;
      updateParams(partialParams);
    },
    [updateParams],
  );

  const hasParam = useCallback(
    <K extends keyof T>(key: K): boolean => {
      return key in currentPageParams && currentPageParams[key] !== undefined;
    },
    [currentPageParams],
  );

  const navigateTo = useCallback(
    (
      targetPath: string,
      options?: {
        params?: Partial<PageStateParams>;
        replace?: boolean;
        preserveCurrentState?: boolean;
      },
    ) => {
      const {
        params = {},
        replace = false,
        preserveCurrentState = true,
      } = options || {};

      if (preserveCurrentState) {
        dispatch(
          setPageState({
            pageName: currentPath,
            params: currentParams as PageStateParams,
          }),
        );
      }

      const targetPathParams = allPageParams[targetPath] || {};

      const mergedParams = {
        ...targetPathParams,
        ...params,
      };

      const sanitizedParams = sanitizeParams(mergedParams);

      const queryString = toQueryString(sanitizedParams);

      navigate(`${targetPath}${queryString}`, { replace });
    },
    [dispatch, currentPath, navigate, currentParams, allPageParams],
  );

  return {
    params: currentPageParams,
    allPageParams,
    pageOrder,
    currentPath,

    getParam,
    hasParam,

    getQueryStringForPath,
    currentQueryString: toQueryString(sanitizeParams(currentPageParams)),

    setParams,
    updateParams,
    clearParams,
    setParam,
    reset,

    navigateTo,

    dispatch,
  };
};
