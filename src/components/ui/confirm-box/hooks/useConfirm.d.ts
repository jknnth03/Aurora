import React from "react";

export interface IConfirmOption<T = unknown> {
	title?: React.ReactNode;
	description?: React.ReactNode;
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

declare const useConfirm: () => <T = unknown>(options?: IConfirmOption<T>) => Promise<IConfirmResult<T>>;

export default useConfirm;
