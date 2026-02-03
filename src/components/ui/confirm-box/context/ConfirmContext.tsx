import React, {
  Fragment,
  ReactNode,
  createContext,
  useCallback,
  useState,
} from "react";

import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import AuroraSpinner from "../../aurora-spinner/aurora-spinner";
import { ResponsiveDialog } from "../../responsive-dialog";
import useDisclosure from "../hooks/useDisclosure";

export interface IConfirmOption<T = unknown> {
  title?: ReactNode;
  description?: ReactNode;
  yesText?: string;
  noText?: string;
  callback?: () => Promise<T>;
}

export interface IConfirmResult<T = unknown> {
  isConfirmed: boolean;
  isCancelled: boolean;
  result?: T;
  error?: any;
}

interface IConfirmContextValue {
  confirm: <T = unknown>(
    options?: IConfirmOption<T>
  ) => Promise<IConfirmResult<T>>;
}

interface IConfirmProviderProps {
  children: ReactNode;
}

interface IConfirmOptions {
  title: ReactNode;
  description: ReactNode;
  yesText: string;
  noText: string;
}

type ResolveRejectCallback<T = any> = [
  resolve?: (value: IConfirmResult<T>) => void,
  reject?: (value: IConfirmResult<T>) => void,
  callback?: () => Promise<T>
];

export const ConfirmContext = createContext<IConfirmContextValue>({
  confirm: () => Promise.resolve({ isConfirmed: false, isCancelled: true }),
});

const ConfirmProvider: React.FC<IConfirmProviderProps> = ({ children }) => {
  const { open: isLoading, onToggle: handleLoading } = useDisclosure(false);

  const [options, setOptions] = useState<IConfirmOptions>({
    title: "Confirmation",
    description: "Are you sure you want to do this?",
    yesText: "Yes",
    noText: "No",
  });

  const [resolveRejectCallback, setResolveRejectCallback] =
    useState<ResolveRejectCallback>([]);
  const [resolve, reject, callback] = resolveRejectCallback;

  const confirm = useCallback(
    <T = unknown,>(
      params: IConfirmOption<T> = {}
    ): Promise<IConfirmResult<T>> => {
      const { callback, ...options } = params;

      return new Promise<IConfirmResult<T>>((resolve, reject) => {
        setOptions((currentValue) => ({
          ...currentValue,
          ...options,
        }));

        setResolveRejectCallback([resolve, reject, callback]);
      });
    },
    []
  );

  const handleClose = useCallback(() => {
    setResolveRejectCallback([]);
  }, []);

  const handleCancel = useCallback(() => {
    if (reject) {
      reject({
        isConfirmed: false,
        isCancelled: true,
        result: null,
      });
    }

    handleClose();
  }, [reject, handleClose]);

  const handleConfirm = useCallback(() => {
    if (callback) {
      handleLoading();
      callback()
        .then((result) =>
          resolve?.({
            isConfirmed: true,
            isCancelled: false,
            result: result,
          })
        )
        .catch((error) =>
          reject?.({
            isConfirmed: true,
            isCancelled: false,
            error: error,
          })
        )
        .finally(() => {
          handleLoading();
          handleClose();
        });
    } else if (resolve) {
      resolve({
        isConfirmed: true,
        isCancelled: false,
        result: null,
      });
      handleClose();
    }
  }, [resolve, reject, callback, handleClose, handleLoading]);

  return (
    <Fragment>
      <ConfirmContext.Provider value={{ confirm }}>
        {children}
      </ConfirmContext.Provider>

      <ResponsiveDialog
        open={resolveRejectCallback.length === 3}
        onClose={handleCancel}
        maximize={false}
        onOpen={() => {}} // Required for ResponsiveDialog but not needed for confirm
        dialogProps={{
          className: "confirm",
          maxWidth: "xs",
          slotProps: {
            paper: {
              sx: {
                minWidth: "inherit",
              },
            },
          },
        }}
      >
        <DialogTitle className="confirm__title">
          <Typography fontWeight={700} className="confirm__title__typography">
            {options.title}
          </Typography>
        </DialogTitle>

        <DialogContent className="confirm__content">
          <Typography variant="body1" className="confirm__content__description">
            {options.description}
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{ margin: "1rem", gap: 1 }}
          className="confirm__actions"
        >
          <Button
            size="large"
            variant="contained"
            color="secondary"
            startIcon={
              isLoading && (
                <AuroraSpinner
                  size={20}
                  primaryColor="InactiveCaptionText"
                  secondaryColor="InactiveCaption"
                />
              )
            }
            disabled={isLoading}
            onClick={handleConfirm}
            disableElevation
          >
            {options.yesText}
          </Button>
          <Button
            disabled={isLoading}
            onClick={handleClose}
            size="large"
            variant="outlined"
            color="error"
          >
            {options.noText}
          </Button>
        </DialogActions>
      </ResponsiveDialog>
    </Fragment>
  );
};

export default ConfirmProvider;
