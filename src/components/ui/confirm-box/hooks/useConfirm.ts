import React from "react";
import { ConfirmContext } from "../context/ConfirmContext";

const useConfirm = () => {
	const { confirm } = React.useContext(ConfirmContext);

	return confirm;
};

export default useConfirm;
