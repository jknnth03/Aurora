// import Badge from "@mui/material/Badge";
// import Box from "@mui/material/Box";
// import IconButton from "@mui/material/IconButton";
// import Typography from "@mui/material/Typography";
// import { RocketLaunch } from "@phosphor-icons/react";
// import { MouseEventHandler, useEffect, useState } from "react";
// import { Link } from "react-router";
// import { CONFIG } from "../../../config/config";
// import { useGetPatchNotesPublicQuery } from "../../../features/api/aurora/masterlist/patch-notes.api";
// import { isWithinBuffer } from "../../../pages/patch/utils/isWithinBuffer";
// import CoolTip from "../cool-tip/cool-tip";

// const PatchMarker = () => {
//   const [isClicked, setIsClicked] = useState(false);
//   const [isRightClicked, setIsRightClicked] = useState(false);
//   const { data } = useGetPatchNotesPublicQuery({
//     status: "published",
//     per_page: 1,
//   });

//   const versionCode = data?.data?.data[0]?.version
//     ? "v" + data?.data?.data[0]?.version
//     : "";
//   const versionTitle = data?.data?.data[0]?.title ?? "";
//   const versionDescription = data?.data?.data[0]?.description ?? "";

//   const shouldShow = data?.data?.data[0]?.published_at
//     ? isWithinBuffer(
//         data?.data?.data[0]?.published_at,
//         CONFIG.PATCH_BUFFER_LEVEL,
//       )
//     : false;

//   // Check session storage when component mounts or version changes
//   useEffect(() => {
//     if (versionCode) {
//       const seenVersion = sessionStorage.getItem("seenPatchVersion");
//       const hasSeenCurrentVersion = seenVersion === versionCode;
//       setIsClicked(hasSeenCurrentVersion);
//     }
//   }, [versionCode]);

//   const handleClick = () => {
//     if (versionCode && !isClicked) {
//       // Store the current version as seen in session storage
//       sessionStorage.setItem("seenPatchVersion", versionCode);
//       setIsClicked(true);
//     }
//   };

//   return (
//     <Link to={"/patch"} target="_blank">
//       <Badge
//         color="error"
//         variant="dot"
//         overlap="circular"
//         badgeContent={isClicked ? 0 : " "}>
//         <IconButton
//           size="small"
//           className={isClicked ? "none" : "snack-icon warning-icon"}
//           onClick={handleClick}>
//           <CoolTip
//             placement="bottom-end"
//             alttitle={
//               <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
//                 <Typography
//                   variant="caption"
//                   sx={{ fontSize: "0.7rem", fontWeight: "bold" }}>
//                   {versionCode} is here, check it now!
//                 </Typography>
//                 <Typography
//                   variant="caption"
//                   sx={{ fontSize: "0.65rem", fontWeight: "medium" }}>
//                   {versionTitle}
//                 </Typography>
//                 <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>
//                   {versionDescription}
//                 </Typography>
//               </Box>
//             }
//             title={
//               <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
//                 <Typography
//                   variant="caption"
//                   sx={{ fontSize: "0.7rem", fontWeight: "bold" }}>
//                   {versionCode} is here, check it now!
//                 </Typography>
//                 <Typography
//                   variant="caption"
//                   sx={{ fontSize: "0.65rem", fontWeight: "medium" }}>
//                   {versionTitle}
//                 </Typography>
//               </Box>
//             }>
//             <RocketLaunch
//               weight={shouldShow ? "fill" : undefined}
//               color={shouldShow ? "var(--success-main)" : undefined}
//             />
//           </CoolTip>
//         </IconButton>
//       </Badge>
//     </Link>
//   );
// };

// export default PatchMarker;
