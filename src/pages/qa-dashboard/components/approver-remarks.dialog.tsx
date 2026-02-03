import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { ResponsiveDialog } from "../../../components/ui/responsive-dialog";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
export const ApproverRemarksDialog = ({
  openViewRemarks,
  setOpenViewRemarks,
}: {
  openViewRemarks: { open: boolean; remarks: string };
  setOpenViewRemarks: React.Dispatch<
    React.SetStateAction<{ open: boolean; remarks: string }>
  >;
}) => {
  return (
    <ResponsiveDialog
      open={openViewRemarks.open}
      onClose={() => {
        setOpenViewRemarks({ open: false, remarks: "" });
      }}
      disableClickAway={true}
      maxHeight="350px"
    >
      <DialogTitle>Approver Remarks</DialogTitle>
      <DialogContent>
        <Paper>
          <Box
            minHeight={"150px"}
            maxHeight={"200px"}
            padding={"1rem"}
            overflow={"auto"}
          >
            <Typography>{openViewRemarks.remarks}</Typography>
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => {
            setOpenViewRemarks({ open: false, remarks: "" });
          }}
        >
          Close
        </Button>
      </DialogActions>
    </ResponsiveDialog>
  );
};
