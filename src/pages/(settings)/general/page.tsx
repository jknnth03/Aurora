import { PhosphorLogo, Tabs } from "@phosphor-icons/react";
import Pane, { PaneItem } from "../../../components/ui/pane/pane";
import { findModuleByAlias } from "../../../config/modules/modulesUtility";

const General = () => {
	const module = findModuleByAlias("Settings");

	const children = Object.values(module?.CHILDREN?.GENERAL?.CHILDREN ?? {});
	const paneItems: PaneItem[] = [
		{
			id: 1,
			label: "sample",
			icon: <PhosphorLogo />,
			content: <></>,
		},
		{
			id: 2,
			label: "sam2ple",
			icon: <PhosphorLogo />,
			content: <></>,
		},
	];

	return (
		<>
			<Tabs></Tabs>
		</>
	);
};

export default General;
