<template>
  <div>
    <div class="content-container">
      <div class="card card-grid table-responsive">
        <table class="table custom-table">
          <thead class="sticky-headers">
            <tr>
              <draggable
                class="upperTable"
                v-model="upperTableHeaders"
                :options="{ handle: '.handle', ...dragOptions }"
                :style="{ width: `${tableWidth}px` }"
                @change="updateTableHeaders"
              >
                <th
                  class="handle"
                  v-for="header in upperTableHeaders"
                  :key="header[0]"
                  :style="{ width: `${header[1]}%` }"
                  v-resizable="{ handle: '.resize-handle' }"
                  v-if="checkedUpperHeaders.includes(header[0])"
                >
                  {{ header[0] }}
                </th>
              </draggable>
            </tr>
            <tr>
              <draggable
                v-model="tableHeaders"
                :options="{ handle: '.handle' }"
                @start="drag = true"
                @end="drag = false"
              >
                <th
                  class="handle"
                  id="tableheader"
                  v-for="header in tableHeaders"
                  :key="header"
                  @click="onClickHeader(header)"
                  v-if="checkedHeaders.includes(header)"
                >
                  {{ header }}

                  <input
                    class="search-input"
                    v-model="searchQuery[header]"
                    type="text"
                    @click.stop
                  />
                  <transition name="fade">
                    <span v-if="sortOrder[header] === 'asc'">&#x25B2;</span>
                  </transition>
                  <transition name="fade">
                    <span v-if="sortOrder[header] === 'desc'">&#x25BC;</span>
                  </transition>
                </th>
              </draggable>
            </tr>
          </thead>

          <tbody>
            <draggable
              class="data-table"
              v-model="tableData"
              :options="{ handle: '.handle', ...dragOptions }"
            >
              <transition-group
                tag="tbody"
                type="transition"
                :name="!drag ? 'flip-list' : null"
              >
                <tr
                  class="handle table-row"
                  v-for="item in filteredTableData"
                  :key="item.id"
                >
                  <td
                    class="handle"
                    v-for="header in tableHeaders"
                    :key="header"
                    v-if="checkedHeaders.includes(header)"
                  >
                    {{ item[header.toLowerCase()] }}
                  </td>
                </tr>
              </transition-group>
            </draggable>
          </tbody>
        </table>
      </div>

      <div class="pivot-mode">
        <tr>
          <draggable v-model="tableHeaders" :options="{ handle: '.handle' }">
            <transition-group
              tag="tbody"
              type="transition"
              :name="!drag ? 'flip-list' : null"
            >
              <th
                class="handle pivot-mode"
                v-for="header in tableHeaders"
                :key="header"
              >
                {{ header }}
                <input
                  type="checkbox"
                  :value="header"
                  @input="toggleColumn(header)"
                  :checked="checkedHeaders.includes(header)"
                />
              </th>
            </transition-group>
          </draggable>
        </tr>
        <tr>
          <draggable
            v-model="upperTableHeaders"
            :options="{ handle: '.handle' }"
            @change="updateTableHeaders"
          >
            <transition-group
              tag="tbody"
              type="transition"
              :name="!drag ? 'flip-list' : null"
            >
              <th
                class="handle pivot-mode"
                v-for="header in upperTableHeaders"
                :key="header[0]"
              >
                {{ header[0] }}
                <input
                  type="checkbox"
                  :value="header[0]"
                  @input="toggleUpperColumn(header[0])"
                  :checked="checkedUpperHeaders.includes(header[0])"
                />
              </th>
            </transition-group>
          </draggable>
        </tr>
      </div>
    </div>
  </div>
</template>
<script>
import draggable from "vuedraggable";
export default {
  data() {
    return {
      checkedUpperHeaders: [],
      checkedHeaders: [],
      tableWidth: ["1975"],
      drag: false,
      upperTableHeaders: [
        ["Participants", 15],
        ["Game of Choice", 10],
        ["Performance", 15],
        ["Budget", 60],
      ],
      headerWidths: {
        Participants: 15,
        "Game of Choice": 10,
        Performance: 15,
        Budget: 60,
      },
      tableHeaders: [
        "Names",
        "Language",
        "Country",
        "Game",
        "Bought",
        "Balance",
        "Rating",
        "Winnings",
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      tableHeaderMap: {
        Participants: ["Names", "Language", "Country"],
        "Game of Choice": ["Game", "Bought"],
        Performance: ["Balance", "Rating", "Winnings"],
        Budget: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
      tableData: [
        {
          id: 1,
          names: "Alice Anderson",
          language: "English",
          country: "USA",
          game: "Chess",
          bought: "✔️",
          balance: "$5,000",
          rating: "★★★",
          winnings: "$61,800",
          jan: "$65,243",
          feb: "$64,235",
          mar: "$60,845",
          apr: "$61,245",
          may: "$63,542",
          jun: "$66,452",
          jul: "$60,124",
          aug: "$58,142",
          sep: "$60,312",
          oct: "$59,842",
          nov: "$60,125",
          dec: "$61,520",
        },
      ],
      searchQuery: {},
      sortOrder: {},
      originalTableData: [],
    };
  },
  computed: {
    dragOptions() {
      return {
        animation: 200,
        ghostClass: "ghost",
      };
    },
    filteredTableData() {
      const searchKeys = Object.keys(this.searchQuery);
      return this.tableData.filter((item) => {
        for (let i = 0; i < searchKeys.length; i++) {
          const key = searchKeys[i];
          if (
            !item[key.toLowerCase()]
              .toLowerCase()
              .includes(this.searchQuery[key].toLowerCase())
          ) {
            return false;
          }
        }
        return true;
      });
    },
  },
  methods: {
    toggleColumn(header) {
      const index = this.checkedHeaders.indexOf(header);
      if (index === -1) {
        this.checkedHeaders.push(header);
      } else {
        this.checkedHeaders.splice(index, 1);
      }
    },
    toggleUpperColumn(header) {
      const index = this.checkedUpperHeaders.indexOf(header);
      if (index === -1) {
        this.checkedUpperHeaders.push(header);
      } else {
        this.checkedUpperHeaders.splice(index, 1);
      }
      this.updateTableHeaders();

      // set width of each header
      this.upperTableHeaders.forEach((upperHeader) => {
        if (this.checkedUpperHeaders.includes(upperHeader[0])) {
          // use original width if header is checked
          upperHeader[1] = this.headerWidths[upperHeader[0]];
        }
      });

      // calculate total width of checked headers
      const totalWidth = this.upperTableHeaders
        .filter((header) => this.checkedUpperHeaders.includes(header[0]))
        .reduce((sum, header) => sum + header[1], 0);

      // adjust width of checked headers
      this.upperTableHeaders.forEach((header) => {
        if (this.checkedUpperHeaders.includes(header[0])) {
          header[1] = Math.round((header[1] / totalWidth) * 10000) / 100;
        }
      });
    },
    mounted() {
      window.addEventListener("resize", () => {
        this.tableWidth = window.innerWidth;
      });
    },
    updateTableHeaders() {
      const newOrder = this.upperTableHeaders
        .filter((header) => this.checkedUpperHeaders.includes(header[0]))
        .map((header) => {
          if (header[0] in this.tableHeaderMap) {
            return this.tableHeaderMap[header[0]];
          } else {
            return [header[0]];
          }
        })
        .flat();
      this.tableHeaders = newOrder;
    },
    onClickHeader(header) {
      if (!header) {
        return;
      }
      let columnData = this.tableData.map((row) => row[header.toLowerCase()]);
      if (this.sortOrder[header] === "asc") {
        this.sortOrder[header] = "desc";
        columnData.sort((a, b) => b.localeCompare(a));
      } else if (this.sortOrder[header] === "desc") {
        this.sortOrder[header] = null;
        this.tableData = JSON.parse(JSON.stringify(this.originalTableData));
        return;
      } else {
        this.sortOrder[header] = "asc";
        columnData.sort((a, b) => a.localeCompare(b));
      }

      for (let i = 0; i < this.tableData.length; i++) {
        this.tableData[i][header.toLowerCase()] = columnData[i];
      }
    },
  },
  created() {
    // make a copy of the original table data
    this.originalTableData = JSON.parse(JSON.stringify(this.tableData));
    this.checkedHeaders = [...this.tableHeaders];
    this.checkedUpperHeaders = this.upperTableHeaders.map(
      (header) => header[0]
    );
    // store original width of each header
    this.headerWidths = {};
    this.upperTableHeaders.forEach((header) => {
      this.headerWidths[header[0]] = header[1];
    });
  },
  components: {
    draggable,
  },
};
</script>

<style>
.swapping {
  transition: all 0.3s ease-in-out;
}
.card-grid {
  height: 85vh;
  width: 68vw;
}
table {
  border-radius: 5%;
}

.table-responsive {
  /* Change the scrollbar width and color for Firefox */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.4) rgba(138, 33, 33, 0.1);
}

/* Change the scrollbar width and color for WebKit-based browsers */
.table-responsive::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  background-color: 39304e (255, 255, 255, 0.1);
}

.table-responsive::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.38);
  border-radius: 4px;
}
.table-responsive::-webkit-scrollbar-track {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.custom-table td,
.custom-table th {
  transition: all 0.3s ease-in-out;
  text-align: center;
  vertical-align: middle;
  font-size: 13px;
  table-layout: auto;
  padding: 7.5px;
  width: 100vw;
  border-bottom: #39304e 1px solid;
}
.table.custom-table th {
  border-bottom: #676176 1px solid;
}
.table.custom-table td {
  border-top: none;
}
.custom-table th {
  height: 75px;
  border-top: none;
  padding-top: 2rem;
  border-left: none;
}
.custom-table td {
  padding-top: 1rem;
  padding-bottom: 1rem;
  width: 5%;
  overflow: hidden;
  padding-left: 0.1rem;
  padding-right: 0.1rem;
  text-align: center;
  justify-content: center;
  align-items: center;
  align-self: center;
  height: 4.5vh;
  line-height: 0.5; /* Add this line to adjust line-height */
  white-space: nowrap; /* Add this line to prevent text wrapping */
  text-overflow: ellipsis; /* Add this line to indicate truncated text */
}
.custom-table .handle:active {
  position: relative;
  z-index: 0;
  cursor: grabbing;
  background-color: none;
}
.handle:hover {
  position: relative;
  background-color: #323346;
  color: #ffffff;
  z-index: 0;
}

.handle p {
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

th:hover,
td:hover {
  cursor: pointer;
}
.search-input {
  width: 80px;
  height: 30px;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #2b3553;
  border-radius: 5px;
  background-color: #27293d;
  transition: border-color 0.3s ease-in-out;
  caret-color: white;
  color: white;
}
.search-input:focus {
  outline: none;
  border-color: #e44cc4;
}

.upperTable {
  display: flex;
  width: 100vw;
  margin: 0 auto;
  table-layout: auto;
  border-bottom: none;
}

.sticky-headers {
  position: sticky;
  top: 0;
  z-index: 1;
  opacity: 1;
  background-color: #27293d;
  background-image: linear-gradient(
    315deg,
    hsl(234deg 17% 25%) 0%,
    hsl(234deg 19% 22%) 35%,
    hsl(235deg 22% 20%) 100%
  );
  width: 100vw;
  color: #c5d6ce;
}
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
}
.content-container {
  display: flex;
  margin: 0 auto;
  height: 85vh;
  background-image: linear-gradient(
    315deg,
    hsl(234deg 19% 22%) 20%,
    hsl(234deg 17% 25%) 20%,
    hsl(235deg 22% 20%) 100%
  );
  border-radius: 5px;
}

.pivot-mode {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  border: 1px solid #3c4663;
  margin: 1rem;
  transition: all 0.3s ease-in-out;
  text-align: center;
  z-index: 1;
}

.pivot-mode th:hover {
  background-color: #37394f;
}
</style>
