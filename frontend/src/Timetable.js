import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Table,
  TableRow,
  TableCell,
  Paragraph,
  WidthType,
  TextRun,
  BorderStyle,
} from "docx";
import "./index.css";

const timeSlots = [
  "9am-10am",
  "10am-11am",
  "11:20am-12:20pm",
  "12:20pm-1:20pm",
  "2pm-3pm",
  "3pm-4pm",
  "4pm-5pm",
];

const multiSlotMap = {
  "9am-11am": ["9am-10am", "10am-11am"],
  "11:20am-1:20pm": ["11:20am-12:20pm", "12:20pm-1:20pm"],
  "2pm-4pm": ["2pm-3pm", "3pm-4pm"],
  "2pm-5pm": ["2pm-3pm", "3pm-4pm", "4pm-5pm"],
};

const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

const Timetable = () => {
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTimetable = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch("http://localhost:8000/api/timetable", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Failed to fetch timetable");
        }

        const data = await response.json();
        setTimetable(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  const handleDownload = () => {
    const tableRows = [];
    const mergedCellsDocx = {};

    const defaultBorder = {
      top: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
      left: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
      right: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
    };

    const headerCells = [
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Timings",
                bold: true,
                size: 26,
                font: "Arial",
              }),
            ],
          }),
        ],
        width: { size: 20, type: WidthType.PERCENTAGE },
        borders: defaultBorder,
      }),
      ...days.map((day) => {
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        const date = timetable[day]?.date || "";
        return new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: dayName,
                  bold: true,
                  size: 24,
                  font: "Arial",
                }),
              ],
            }),
            new Paragraph({
              children: [new TextRun({ text: date, size: 22, font: "Arial" })],
            }),
          ],
          width: { size: 16, type: WidthType.PERCENTAGE },
          borders: defaultBorder,
        });
      }),
    ];

    tableRows.push(new TableRow({ children: headerCells }));

    timeSlots.forEach((slot) => {
      const rowCells = [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: slot,
                  bold: true,
                  size: 24,
                  font: "Arial",
                }),
              ],
            }),
          ],
          borders: defaultBorder,
        }),
      ];

      days.forEach((day) => {
        if (mergedCellsDocx[`${day}-${slot}`]) return;

        let foundSubject = "";
        let rowSpan = 1;

        if (timetable[day]?.timings) {
          timetable[day].timings.forEach((time, index) => {
            if (time === slot) {
              foundSubject = timetable[day].subjects[index];
            } else if (multiSlotMap[time]?.[0] === slot) {
              foundSubject = timetable[day].subjects[index];
              rowSpan = multiSlotMap[time].length;
              multiSlotMap[time].forEach((s, i) => {
                if (i !== 0) mergedCellsDocx[`${day}-${s}`] = true;
              });
            }
          });
        }

        rowCells.push(
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: foundSubject, size: 24, font: "Arial" }),
                ],
              }),
            ],
            rowSpan,
            borders: defaultBorder,
          })
        );
      });

      tableRows.push(new TableRow({ children: rowCells }));
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({ text: "Faculty Timetable", heading: "Heading1" }),
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          ],
        },
      ],
    });

    const date = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `Timetable-${date}.docx`);
    });
  };

  const mergedCellsRender = {};

  return (
    <div className="timetable-container">
      {loading ? (
        <p>Loading timetable...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <table className="timetable">
            <thead>
              <tr>
                <th>Timings</th>
                {days.map((day) => (
                  <th key={day}>
                    <div style={{ fontWeight: "bold" }}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </div>
                    <div style={{ fontSize: "0.85em", color: "#555" }}>
                      {timetable[day]?.date || ""}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot}>
                  <td className="timing">{slot}</td>
                  {days.map((day) => {
                    if (mergedCellsRender[`${day}-${slot}`]) return null;

                    let foundSubject = null;
                    let rowSpan = 1;
                    let isMultiSlot = false;

                    if (timetable[day]?.timings) {
                      timetable[day].timings.forEach((time, index) => {
                        if (time === slot) {
                          foundSubject = timetable[day].subjects[index];
                        } else if (multiSlotMap[time]?.[0] === slot) {
                          foundSubject = timetable[day].subjects[index];
                          rowSpan = multiSlotMap[time].length;
                          isMultiSlot = true;
                          multiSlotMap[time].forEach((mergedSlot, i) => {
                            if (i !== 0) {
                              mergedCellsRender[`${day}-${mergedSlot}`] = true;
                            }
                          });
                        }
                      });
                    }

                    return foundSubject ? (
                      <td
                        key={day}
                        rowSpan={rowSpan}
                        className={`subject ${isMultiSlot ? "multi-slot" : ""}`}
                      >
                        {foundSubject}
                      </td>
                    ) : (
                      <td key={day}></td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ textAlign: "center" }}>
            <button onClick={handleDownload} className="download-btn">
              Download Timetable
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Timetable;
