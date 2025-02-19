import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useState } from "react";
import { format } from "date-fns"; // Add this import

type Faculty = {
  id: number;
  name: string;
  is_active: number;
  exam_dates: Array<{
    id: number;
    date: string;
    available_spots: number;
  }>;
};

type FacultiesResponse = Array<{
  program: string;
  faculities_list: Faculty[];
}>;

const topFacultyNames = [
  "Mechanical Engineering (🇮🇹)",
  "Automatic Control and Computer Engineering (🇮🇹)",
  "Civil Engineering and Architecture (🇮🇹)",
  "Aerospace Engineering",
];

// List of bachelor faculties for which exam dates should be replaced
const specialBachelorFaculties = [
  "Mechanical Engineering (🇮🇹)",
  "Automatic Control and Computer Engineering (🇮🇹)",
  "Civil Engineering and Architecture (🇮🇹)",
];

export const FacultyInfo = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const [selectedProgramDegree, setSelectedProgramDegree] = useState<string | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);

  // Fetch all faculties
  const { data: facultiesData, isLoading: isLoadingFaculties } = useQuery<FacultiesResponse>({
    queryKey: ["faculties"],
    queryFn: async () => {
      const response = await api.getFaculties();
      return response.data;
    },
  });

  // Filter faculties based on the chosen program degree
  const filteredFaculties =
      facultiesData?.find((program) =>
          program.program.toLowerCase().includes(selectedProgramDegree?.toLowerCase() || "")
      )?.faculities_list || [];

  // Sort the filtered faculties so that topFacultyNames appear first
  const sortedFaculties = [...filteredFaculties].sort((a, b) => {
    const aIndex = topFacultyNames.indexOf(a.name);
    const bIndex = topFacultyNames.indexOf(b.name);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) {
      return -1;
    }
    if (bIndex !== -1) {
      return 1;
    }
    // If neither faculty is in the top list, leave them in their current order
    return 0;
  });

  // Fetch exam dates for selected faculty
  const { data: examDates, isLoading: isLoadingDates } = useQuery({
    queryKey: ["examDates", selectedFacultyId],
    queryFn: async () => {
      if (!selectedFacultyId) return [];
      const response = await api.getExamDates(Number(selectedFacultyId));
      return response.data;
    },
    enabled: !!selectedFacultyId,
  });

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd.MM.yyyy - HH:mm");
  };

  const handleProgramDegreeChange = (value: string) => {
    setSelectedProgramDegree(value);
    setValue("programDegree", value);
    // Reset faculty selection on program change
    setSelectedFacultyId(null);
    setValue("faculty_id", "");
    setValue("exam_date_id", "");
  };

  const handleFacultyChange = (value: string) => {
    // Найдем выбранный факультет, чтобы проверить, не отключён ли он
    const selectedFaculty = sortedFaculties.find(
        (faculty) => faculty.id.toString() === value
    );
    if (selectedFaculty && selectedFaculty.name.trim().toLowerCase().endsWith("(coming soon)")) {
      // Если факультет недоступен для выбора, ничего не делаем
      return;
    }
    setSelectedFacultyId(value);
    setValue("faculty_id", value);
    setValue("exam_date_id", ""); // Reset exam date when faculty changes
  };

  // Определяем выбранный факультет для применения специального кейса
  const selectedFaculty = sortedFaculties.find(
      (faculty) => faculty.id.toString() === selectedFacultyId
  );

  return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="programDegree">Program Degree</Label>
          <Select onValueChange={handleProgramDegreeChange} value={watch("programDegree")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bachelor">Bachelor&apos;s Degree</SelectItem>
              <SelectItem value="master">Master&apos;s Degree</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="faculty">Faculty</Label>
          <Select
              disabled={!selectedProgramDegree}
              onValueChange={handleFacultyChange}
              value={watch("faculty_id")}
          >
            <SelectTrigger>
              <SelectValue
                  placeholder={
                    !selectedProgramDegree
                        ? "Select program degree first"
                        : isLoadingFaculties
                            ? "Loading..."
                            : "Select faculty"
                  }
              />
            </SelectTrigger>
            <SelectContent>
              {sortedFaculties.map((faculty) => {
                const isComingSoon = faculty.name.trim().toLowerCase().endsWith("(coming soon)");
                return (
                    <SelectItem
                        key={faculty.id}
                        value={faculty.id.toString()}
                        disabled={isComingSoon}
                    >
                      {faculty.name}
                    </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {errors.faculty_id && (
              <p className="text-red-500 text-sm">{errors.faculty_id.message as string}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="examDate">Exam Date</Label>
          <Select
              disabled={!selectedFacultyId}
              onValueChange={(value) => setValue("exam_date_id", value)}
              value={watch("exam_date_id")}
          >
            <SelectTrigger>
              <SelectValue
                  placeholder={
                    !selectedFacultyId
                        ? "Select a faculty first"
                        : isLoadingDates
                            ? "Loading..."
                            : "Select exam date"
                  }
              />
            </SelectTrigger>
            <SelectContent>
              {selectedFaculty && specialBachelorFaculties.includes(selectedFaculty.name) ? (
                  <SelectItem value="special" disabled>
                    May (exact dates will be published soon)
                  </SelectItem>
              ) : (
                  examDates?.map((date: any) => (
                      <SelectItem key={date.id} value={date.id.toString()}>
                        {formatDate(date.date)}
                      </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>
          {errors.exam_date_id && (
              <p className="text-red-500 text-sm">{errors.exam_date_id.message as string}</p>
          )}
        </div>
      </div>
  );
};