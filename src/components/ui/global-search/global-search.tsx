import Autocomplete from "@mui/material/Autocomplete";
import Input from "../input/input";

const GlobalSearch = () => {
	return <Autocomplete options={[]} renderInput={(params) => <Input label="Search" {...params} />} />;
};

export default GlobalSearch;
