import Box from "@mui/material/Box";
import { CaretLeft } from "@phosphor-icons/react/CaretLeft";
import { CaretRight } from "@phosphor-icons/react/CaretRight";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";

export default function MonthYearFilter({
  date,
  setDate,
}: {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentMonth = months[date.getMonth()];
  const currentYear = date.getFullYear();

  const handlePrevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  return (
    <Box
      sx={{
        width: "fit-content",
        height: "100%",
      }}>
      <Grid container sx={{ height: "100%" }}>
        <Grid sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handlePrevMonth}>
            <CaretLeft />
          </IconButton>
        </Grid>
        <Grid>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "fit-content",
              height: "40px",
            }}>
            <Typography
              sx={{ display: "flex", alignItems: "center", height: "100%" }}
              variant="h6">
              {currentMonth} {currentYear}
            </Typography>
          </Box>
        </Grid>
        <Grid sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handleNextMonth}>
            <CaretRight />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
}
