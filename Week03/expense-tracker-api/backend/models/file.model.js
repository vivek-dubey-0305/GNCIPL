import mongoose, { Schema } from "mongoose";

const fileSchema = new Schema({
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  format: { type: String },
  size: { type: Number },
  fileUrl: { type: String, required: true },
  cloudinaryId: { type: String },

  parsedSample: { type: Array },
  parsedData: {
    type: Object, // JSON version of Excel (rows & columns)
  },
  chartOptions: {
    type: Object, // {xAxis: "Column1", yAxis: "Column2", chartType: "bar"}
  },
  generatedCharts: [
    {
      type: String, // URLs for saved chart images (PNG/PDF)
    }
  ],
}, { timestamps: true });

export const File = mongoose.model("File", fileSchema);
