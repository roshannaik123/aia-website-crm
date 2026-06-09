import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import { Button } from "@/components/ui/button";
import { SIDE_POPUP_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Edit } from "lucide-react";
import { useState } from "react";
import SidePopUpForm from "./sidepopup-form";
import FilterDropDown from "@/components/common/filterDropDown";

const SidePopupList = () => {
  const [statusFilter, setStatusFilter] = useState("Active");

  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: SIDE_POPUP_API.list,
    queryKey: ["sidepopups"],
  });

  const popupData = data?.data || [];
  const filteredItems =
    statusFilter === "All"
      ? popupData
      : popupData.filter((item) => item.side_popup_status === statusFilter);
  const filterDropdown = (
    <FilterDropDown
      value={statusFilter}
      onChange={setStatusFilter}
      className="w-[140px]
 h-9
text-sm
font-normal
bg-gray-50
border
border-gray-200
rounded-md
px-3
text-gray-700
focus:border-gray-300
focus:ring-gray-200
"
      options={[
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
        { label: "All", value: "All" },
      ]}
    />
  );
  const [selectedPopupId, setSelectedPopupId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = () => {
    setSelectedPopupId(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedPopupId(id);
    setIsDialogOpen(true);
  };

  const columns = [
    {
      header: "Heading",
      accessorKey: "side_popup_heading",
      enableSorting: false,
    },
    {
      header: "Description",
      accessorKey: "side_popup_description",
      enableSorting: false,
    },
    {
      header: "Status",
      accessorKey: "side_popup_status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.side_popup_status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.side_popup_status}
        </span>
      ),
    },
    {
      header: "Action",
      accessorKey: "action",
      cell: ({ row }) => (
        <Button
          size="icon"
          variant="outline"
          onClick={() => handleEdit(row.original.id)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
    },
  ];
  if (isError) {
    return <ApiErrorPage onRetry={() => refetch()} />;
  }
  return (
    <>
      {isLoading && <LoadingBar />}

      <DataTable
        data={filteredItems}
        columns={columns}
        filter={filterDropdown}
        pageSize={20}
        searchPlaceholder="Search side popup..."
        addButton={{
          onClick: handleCreate,
          label: "Add SidePopUp",
        }}
      />

      <SidePopUpForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        popupId={selectedPopupId}
      />
    </>
  );
};

export default SidePopupList;
