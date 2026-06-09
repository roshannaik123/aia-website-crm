import { useState } from "react";
import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import LoadingBar from "@/components/loader/loading-bar";
import { Button } from "@/components/ui/button";
import { POPUP_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { Edit } from "lucide-react";
import PopupEdit from "./popup-edit";
import FilterDropDown from "@/components/common/filterDropDown";

const PopupList = () => {
  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: POPUP_API.list,
    queryKey: ["popups"],
  });

  const IMAGE_FOR = "Popup";
  const popupBaseUrl = getImageBaseUrl(data?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(data?.image_url);

  const [selectedPopupId, setSelectedPopupId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Yes");

  // filterThe items

  const popupList = data?.data || [];

  const filteredItems =
    statusFilter === "All"
      ? popupList
      : popupList.filter((item) => item.popup_required === statusFilter);

  const handleEdit = (popupId) => {
    setSelectedPopupId(popupId);
    setIsDialogOpen(true);
  };

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
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
        { label: "All", value: "All" },
      ]}
    />
  );

  const columns = [
    {
      header: "Image",
      accessorKey: "popup_image",
      cell: ({ row }) => {
        const fileName = row.original.popup_image;
        const src = fileName ? `${popupBaseUrl}${fileName}` : noImageUrl;
        return (
          <ImageCell
            src={src}
            fallback={noImageUrl}
            alt={`${IMAGE_FOR} Image`}
          />
        );
      },
      enableSorting: false,
    },
    { header: "Page", accessorKey: "page_one_name", enableSorting: false },
    { header: "Required", accessorKey: "popup_required", enableSorting: false },
    { header: "Heading", accessorKey: "popup_heading", enableSorting: false },
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
        searchPlaceholder="Search popups..."
      />

      <PopupEdit
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        popupId={selectedPopupId}
        imageBaseUrl={popupBaseUrl}
        noImageUrl={noImageUrl}
        refetch={refetch}
      />
    </>
  );
};

export default PopupList;
