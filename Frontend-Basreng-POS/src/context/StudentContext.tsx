import { createContext, useContext, useState, ReactNode } from "react";

// Tentukan tipe untuk konteks
interface StudentContextType {
	updated: boolean;
	setUpdated: (value: boolean) => void;
}

// Berikan default value untuk context agar tidak error
const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
	const [updated, setUpdated] = useState(false);

	return (
		<StudentContext.Provider value={{ updated, setUpdated }}>
			{children}
		</StudentContext.Provider>
	);
};

export const useStudent = () => {
	const context = useContext(StudentContext);
	if (!context) {
		throw new Error("useStudent must be used within a StudentProvider");
	}
	return context;
};
