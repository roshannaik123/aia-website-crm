import ApiErrorPage from "@/components/api-error/api-error";
import LoadingBar from "@/components/loader/loading-bar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NEWSLETTER_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { motion } from "framer-motion";
import { Calendar, Mail, Search } from "lucide-react";
import moment from "moment";
import { useMemo, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
const NewsLetter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openDownload, setOpenDownload] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: NEWSLETTER_API.list,
    queryKey: ["newsletter-list"],
  });
  const newsletters = data?.data || [];

  const filteredNewsletters = useMemo(() => {
    let result = newsletters;

    // Email Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      result = result.filter((item) =>
        item.newsletter_email.toLowerCase().includes(query),
      );
    }

    // Date Filter
    if (fromDate && toDate) {
      result = result.filter((item) => {
        const created = moment(item.newsletter_created);
        return created.isBetween(fromDate, toDate, "day", "[]");
      });
    }

    return result;
  }, [searchQuery, newsletters, fromDate, toDate]);
  const handleClearFilters = () => {
    setSearchQuery("");
    setFromDate("");
    setToDate("");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };
  const handleDownloadExcel = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select From Date and To Date");
      return;
    }

    if (moment(fromDate).isAfter(toDate)) {
      toast.error("From date cannot be greater than To date");
      return;
    }

    const filtered = newsletters
      .filter((item) => {
        const created = moment(item.newsletter_created);
        return created.isBetween(fromDate, toDate, null, "[]");
      })
      .sort(
        (a, b) =>
          moment(a.newsletter_created).valueOf() -
          moment(b.newsletter_created).valueOf(),
      );

    if (filtered.length === 0) {
      toast.error("No data found for selected date range");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Newsletters");

    worksheet.columns = [
      { header: "Email", key: "email", width: 35 },
      { header: "Created Date", key: "date", width: 20 },
    ];

    filtered.forEach((item) => {
      worksheet.addRow({
        email: item.newsletter_email,
        date: moment(item.newsletter_created).format("DD-MM-YYYY"),
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "newsletter-list.xlsx");

    toast.success("Excel downloaded successfully");

    setFromDate("");
    setToDate("");
    setOpenDownload(false);
  };
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <>
      {isLoading && <LoadingBar />}

      <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Newsletters
                </h1>
                <p className="text-sm text-gray-500">
                  Manage and view all newsletter subscribers
                </p>
              </div>
              <div className="flex gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  className="w-full sm:w-80"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by email"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 pl-10  pr-3 text-sm bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </motion.div>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-10 w-40"
                />

                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-10 w-40"
                />

                <Button variant="outline" onClick={handleClearFilters}>
                  Clear
                </Button>
                <Dialog open={openDownload} onOpenChange={setOpenDownload}>
                  <DialogTrigger asChild>
                    <Button>Download</Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Download Newsletters</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                      <div>
                        <label className="text-sm text-gray-600">
                          From Date
                        </label>
                        <Input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-600">To Date</label>
                        <Input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={handleDownloadExcel}
                        disabled={!fromDate || !toDate}
                      >
                        {" "}
                        Download Excel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>

          {filteredNewsletters.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="text-center">
                <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">
                  No newsletters found
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery ? "Try adjusting your search" : "No data yet"}
                </p>
              </div>
            </motion.div>
          ) : (
            <Card className="p-2">
              <motion.div
                variants={containerVariants}
                initial={false}
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
              >
                {filteredNewsletters.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    whileHover={{
                      y: -4,
                      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
                    }}
                    className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-600">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span>
                        {moment(item.newsletter_created).format(
                          "DD MMMM YYYY",
                        )}{" "}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100 mb-3" />

                    {/* Email */}
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />

                      <a
                        href={`mailto:${item.newsletter_email}`}
                        className="text-sm font-medium text-gray-900 break-all hover:underline"
                      >
                        {item.newsletter_email}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default NewsLetter;
