import { ReactNode } from "react";
import { Provider } from "react-redux";
import store from "../app/store";
import ProvidesTheme from "../themes/ProvidesThemes";
import { AuthProvider } from "./AuthProvider";
import ConfirmProvider from "../components/ui/confirm-box/context/ConfirmContext";

const Providers = ({ children }: Readonly<{ children: ReactNode }>) => {
	return (
		<>
			<Provider store={store}>
				<AuthProvider>
					<ProvidesTheme>
						<ConfirmProvider>{children}</ConfirmProvider>
					</ProvidesTheme>
				</AuthProvider>
			</Provider>
		</>
	);
};

export default Providers;
