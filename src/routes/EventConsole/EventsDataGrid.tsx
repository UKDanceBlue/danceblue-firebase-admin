import { GridColumns } from "@mui/x-data-grid";
import { Timestamp, collection } from "firebase/firestore";
import { useFirestore } from "reactfire";

import FirestoreCollectionDataGrid from "../../components/FirestoreCollectionDataGrid";
import LoadableImage from "../../components/LoadableImage";
import { RawFirestoreEvent } from "../../firebase/FirestoreEvent";

const columns: GridColumns<RawFirestoreEvent & {id: string}> = [
  {
    field: "title",
    headerName: "Title",
    editable: true,
    flex: 1
  },
  {
    field: "startTime",
    headerName: "Start Time",
    type: "dateTime",
    valueGetter: ({ row }) => row.startTime?.toDate(),
    valueSetter: ({
      value, row
    }) => ({ ...row, startTime: value instanceof Date ? Timestamp.fromDate(value) : Timestamp.now() }),
    editable: true,
    flex: 1
  },
  {
    field: "endTime",
    headerName: "End Time",
    type: "dateTime",
    valueGetter: ({ value }) => value?.toDate(),
    valueSetter: ({
      value, row
    }) => ({ ...row, endTime: Timestamp.fromDate(value) }),
    editable: true,
    flex: 1
  },
  {
    field: "address",
    headerName: "Address",
    editable: true,
    flex: 2
  },
  {
    field: "link",
    headerName: "Link",
    renderCell: ({ value }) => {
      if (value == null) {
        return null;
      } else if (Array.isArray(value)) {
        return (
          <div>
            {value.map((link, index) => (<a key={index} href={link.url} target="_blank" rel="noreferrer">{link.text}</a>))}
          </div>
        );
      } else {
        return (<a href={value.url} target="_blank" rel="noreferrer">{value.text}</a>);
      }
    },
    flex: 1.8
  },
  {
    field: "description",
    headerName: "Description",
    editable: true,
    flex: 3
  },
  {
    field: "image",
    headerName: "Image",
    renderCell: (rowData) => rowData.value == null ? undefined : <LoadableImage
      src={rowData.value?.uri}
      alt={rowData.value.title ?? ""}
      isStorageUri={rowData.value?.uri.startsWith("gs://")}
      height={160} />,
    flex: 3
  }
];

const EventsDataGrid = () => {
  const firestore = useFirestore();

  return (
    <div style={{ minHeight: "60vh", display: "flex" }}>
      <div style={{ flex: 1, padding: "1em" }}>
        <FirestoreCollectionDataGrid
          firestoreCollectionRef={collection(firestore, "events")}
          columns={columns}
          dataGridProps={{ getRowHeight: () => "auto" }}
          enablePopover
          defaultSortField="startTime"
        />
      </div>
    </div>
  );
};

export default EventsDataGrid;