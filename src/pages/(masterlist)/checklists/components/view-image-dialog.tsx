import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { ResponsiveDialog } from "../../../../components/ui/responsive-dialog";
import Box from "@mui/material/Box";
import { saveAs } from "file-saver/";

const ViewImageDialog = ({
  viewImage,
  setViewImage,
  imgSrc,
  setImgSrc,
  currentImageUrl,
}: {
  viewImage: boolean;
  setViewImage: React.Dispatch<React.SetStateAction<boolean>>;
  imgSrc: string;
  currentImageUrl: string;
  setImgSrc: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const handleClose = () => {
    setImgSrc("");
    setViewImage(false);
  };

  const handleSave = () => {
    try {
      saveAs(imgSrc, currentImageUrl);
    } catch (error) {
      console.error("Error downloading Base64 image:", error);
    }
  };

  return (
    <ResponsiveDialog open={viewImage} onClose={handleClose} maxHeight="62vh">
      <DialogTitle>Attachment Display</DialogTitle>
      <DialogContentText>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="970px"
          margin="auto">
          <img
            src={imgSrc}
            style={{
              width: "980px",
              height: "460px",
              objectFit: "contain",
              display: "block",
              margin: "auto",
            }}
            alt="Image"
          />
        </Box>
      </DialogContentText>
      <DialogActions>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outlined" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </ResponsiveDialog>
  );
};

export default ViewImageDialog;
