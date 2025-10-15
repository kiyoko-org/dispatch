import { useReports } from "@kiyoko-org/dispatch-lib";
import { Database } from "@kiyoko-org/dispatch-lib/database.types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";

export default function ReportDetails() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { getReportInfo } = useReports()
	const [reportInfo, setReportInfo] = useState<Database["public"]["Tables"]["reports"]["Row"] | null>(null)

	useEffect(() => {
		const fetchReport = async () => {
			if (id) {
				const report = await getReportInfo(Number(id));

				if (report.error) {
					console.error("Error fetching report:", report.error);
					return;
				}

				setReportInfo(report.data);
			}
		}

		fetchReport()
	}, [])

	if (reportInfo) {
		return (
			<Text>Report Details: {JSON.stringify(reportInfo, null, 2)}</Text>
		)
	}

	return <Text>Report Details for ID: {id}</Text>;
}
