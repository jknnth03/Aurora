import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { Suspense } from "react";
import UserDialog from "../../pages/(masterlist)/users/dialog/user-dialog";
import RoleDialog from "../../pages/(masterlist)/roles/dialog/role-dialog";
import FinderDialog from "../ui/finder/components/finder-dialog";
import ThemePickerDialog from "../ui/theme-picker/components/theme-picker-dialog";
// import PatchNotesDialog from "../../pages/(masterlist)/patch-notes/dialog/patch-notes-dialog";
import MarkDownEditDialog from "./markdown-editor-dialog";
import StoreDialog from "../../pages/(masterlist)/store/dialog/store-dialog";
import RegionDialog from "../../pages/(masterlist)/regions/dialog/region-dialog";
import AreaDialog from "../../pages/(masterlist)/areas/dialog/area-dialog";
import ScoreRatingDialog from "../../pages/(masterlist)/score-rating/dialog/score-rating-dialog";
import QAChecklistDialog from "../../pages/qa-dashboard/components/qa-dialog";
import StoreChecklistDialog from "../../pages/(masterlist)/store-checklist/dialog/store-checklist-dialog";

// Loading fallback component
const DialogLoadingFallback = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      zIndex: 9999,
    }}>
    <CircularProgress />
  </Box>
);

const QueryDialogs = () => {
  return (
    <Suspense fallback={<DialogLoadingFallback />}>
      <RegionDialog />
      <AreaDialog />
      <UserDialog />
      <RoleDialog />
      <FinderDialog />
      {/* <PatchNotesDialog /> */}
      <StoreDialog />
      <ThemePickerDialog />
      <MarkDownEditDialog />
      <ScoreRatingDialog />
      <QAChecklistDialog />
      <StoreChecklistDialog />
    </Suspense>
  );
};

export default QueryDialogs;
