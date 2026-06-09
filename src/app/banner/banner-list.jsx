import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import FilterDropDown from "@/components/common/filterDropDown";
import ImageCell from "@/components/common/ImageCell";
import LoadingBar from "@/components/loader/loading-bar";
import { BANNER_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { Edit } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const BannerList = () => {
  const {
    data: data,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: BANNER_API.list,
    queryKey: ["banner-list"],
  });

  const [statusFilter, setStatusFilter] = useState("Active");
  const [bannerForFilter, setBannerForFilter] = useState("All");
  const IMAGE_FOR = "Banner";
  const bannerBaseUrl = getImageBaseUrl(data?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(data?.image_url);

  const bannerData = data?.data || [];
  const bannerFor = [
    ...new Set(bannerData.map((bannerData) => bannerData.banner_for)),
  ];
  const filterBannerFor = (
    <FilterDropDown
      value={bannerForFilter}
      onChange={setBannerForFilter}
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
        { label: "All", value: "All" },
        ...bannerFor.map((item) => ({
          label: item,
          value: item,
        })),
      ]}
    />
  );

  const bannerForFiltered =
    bannerForFilter === "All"
      ? bannerData
      : bannerData.filter((item) => item.banner_for === bannerForFilter);

  const filteredData =
    statusFilter === "All"
      ? bannerForFiltered
      : bannerForFiltered.filter((item) => item.banner_status === statusFilter);
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

  const columns = [
    {
      header: "Image",
      accessorKey: "banner_image",
      cell: ({ row }) => {
        const fileName = row.original.banner_image;
        const src = fileName ? `${bannerBaseUrl}${fileName}` : noImageUrl;

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
    {
      header: "Sort Order",
      accessorKey: "banner_sort",
      enableSorting: true,
    },
    {
      header: "Banner For",
      accessorKey: "banner_for",
      enableSorting: true,
    },
    {
      header: "Banner Text",
      accessorKey: "banner_text",
      enableSorting: false,
    },
    {
      header: "Alt Text",
      accessorKey: "banner_image_alt",
      enableSorting: false,
    },
    {
      header: "Status",
      accessorKey: "banner_status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.banner_status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.banner_status}
        </span>
      ),
      enableSorting: true,
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div>
          <Link
            title="banner edit"
            to={`/edit-banner/${row.original.id}`}
            className="cursor-pointer"
          >
            <Edit className=" h-4 w-4 hover:text-blue-600" />
          </Link>
        </div>
      ),
      enableSorting: false,
    },
  ];
  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;
  return (
    <>
      <DataTable
        data={filteredData}
        columns={columns}
        filter={filterDropdown}
        filterBannerFor={filterBannerFor}
        pageSize={20}
        searchPlaceholder="Search banners..."
        addButton={{
          to: "/add-banner",
          label: "Add Banner",
        }}
      />
    </>
  );
};

export default BannerList;
