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
                @end="updateUpperTableHeaders"
                @change="updateTableHeaders"
              >
                <th
                  class="handle"
                  v-for="header in upperTableHeaders"
                  :key="header[0]"
                  :style="{ width: `${header[1]}%` }"
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
                  v-for="header in tableHeaders"
                  :key="header"
                  @click="onClickHeader(header)"
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
          <draggable
            v-model="tableHeaders"
            :options="{ handle: '.handle' }"
            @start="drag = true"
            @end="drag = false"
          >
            <transition-group
              tag="tbody"
              type="transition"
              :name="!drag ? 'flip-list' : null"
            >
              <th
                class="handle pivot-mode"
                v-for="header in tableHeaders"
                :key="header"
                @click="onClickHeader(header)"
              >
                {{ header }}
              </th>
            </transition-group>
          </draggable>
        </tr>
        <tr>
          <draggable
            v-model="upperTableHeaders"
            :options="{ handle: '.handle' }"
            @start="drag = true"
            @end="updateUpperTableHeaders"
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
                :key="header"
                @click="onClickHeader(header)"
              >
                {{ header[0] }}
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
      tableWidth: ["1975"],
      drag: false,
      upperTableHeaders: [
        ["Participants", 15],
        ["Game of Choice", 10],
        ["Performance", 15],
        ["Budget", 60],
      ],
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
        {
          id: 2,
          names: "Tony Smith",
          language: "English",
          country: "Ireland",
          game: "Chess",
          bought: "✖️",
          balance: "$2,000",
          rating: "★★★★★",
          winnings: "$7,000",
          jan: "$6,243",
          feb: "$6,235",
          mar: "$6,845",
          apr: "$6,245",
          may: "$6,542",
          jun: "$6,452",
          jul: "$6,124",
          aug: "$5,142",
          sep: "$6,312",
          oct: "$5,842",
          nov: "$6,125",
          dec: "$6,520",
        },
        {
          id: 3,
          names: "Andrew Connell",
          language: "English",
          country: "England",
          game: "Checkers",
          bought: "✖️",
          balance: "$50,000",
          rating: "★★★★★",
          winnings: "$70,000",
          jan: "$11,542",
          feb: "$11,235",
          mar: "$11,845",
          apr: "$11,245",
          may: "$11,542",
          jun: "$11,452",
          jul: "$11,124",
          aug: "$11,142",
          sep: "$11,112",
          oct: "$10,042",
          nov: "$10,525",
          dec: "$11,520",
        },
        {
          id: 4,
          names: "Kevin Flanagan",
          language: "Spanish",
          country: "Uruguay",
          game: "Rithmomachy",
          bought: "✖️",
          balance: "$65,500",
          rating: "★★★★",
          winnings: "$12,000",
          jan: "$765,243",
          feb: "$764,235",
          mar: "$760,845",
          apr: "$761,245",
          may: "$763,542",
          jun: "$766,452",
          jul: "$760,124",
          aug: "$758,142",
          sep: "$760,312",
          oct: "$759,842",
          nov: "$760,125",
          dec: "$761,520",
        },
        {
          id: 5,
          names: "Dimple Unalkat",
          language: "Portuguese",
          country: "Portugal",
          game: "Game of the Generals",
          bought: "✖️",
          balance: "$85,310",
          rating: "★★",
          winnings: "$1,780",
          jan: "$75,243",
          feb: "$74,235",
          mar: "$70,845",
          apr: "$71,245",
          may: "$73,542",
          jun: "$76,452",
          jul: "$70,124",
          aug: "$78,142",
          sep: "$60,312",
          oct: "$79,842",
          nov: "$70,125",
          dec: "$71,520",
        },
        {
          id: 6,
          names: "Gil Lopes",
          language: "Spanish",
          country: "Colombia",
          game: "Hare and Hounds",
          bought: "✖️",
          balance: "$5,001",
          rating: "★",
          winnings: "$18,000",
          jan: "$3,450",
          feb: "$6,465",
          mar: "605",
          apr: "$6,145",
          may: "$3,542",
          jun: "$3,452",
          jul: "$3,124",
          aug: "$3,142",
          sep: "$3,312",
          oct: "$3,842",
          nov: "$3,125",
          dec: "$3,520",
        },
        {
          id: 7,
          names: "Sophie Beckham",
          language: "English",
          country: "Ireland",
          game: "Sugoroku",
          bought: "✔️",
          balance: "$2,000",
          rating: "★★★",
          winnings: "$500",
          jan: "$45,243",
          feb: "$44,235",
          mar: "$40,845",
          apr: "$41,245",
          may: "$43,542",
          jun: "$46,452",
          jul: "$40,124",
          aug: "$48,142",
          sep: "$40,312",
          oct: "$49,842",
          nov: "$40,125",
          dec: "$41,520",
        },
        {
          id: 8,
          names: "Isabelle Black",
          language: "French",
          country: "France",
          game: "Nine Men's Morris",
          bought: "✔️",
          balance: "$50,000",
          rating: "★★★★★",
          winnings: "$756,000",
          jan: "$94,520",
          feb: "$94,235",
          mar: "$95,201",
          apr: "$96,512",
          may: "$98,452",
          jun: "$96,452",
          jul: "$90,153",
          aug: "$98,142",
          sep: "$90,312",
          oct: "$99,842",
          nov: "$60,125",
          dec: "$61,520",
        },
        {
          id: 9,
          names: "Emily Braxton",
          language: "Maltese",
          country: "Malta",
          game: "Blockade",
          bought: "✔️",
          balance: "$65,500",
          rating: "★★★★★",
          winnings: "$2,985",
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
        {
          id: 10,
          names: "Olivia Brennan",
          language: "French",
          country: "France",
          game: "Patolli",
          bought: "✔️",
          balance: "$85,609",
          rating: "★★★★",
          winnings: "$7,780",
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
        {
          id: 11,
          names: "Lily Brock",
          language: "Italian",
          country: "Italy",
          game: "YINSH",
          bought: "✖️",
          balance: "$5,020",
          rating: "★",
          winnings: "$1,000",
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
        {
          id: 12,
          names: "Chloe Bryson",
          language: "Greek",
          country: "Greece",
          game: "Downfall",
          bought: "✖️",
          balance: "$2,000",
          rating: "★★★★",
          winnings: "$2,000",
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
        {
          id: 13,
          names: "Isabella Caldwell",
          language: "English",
          country: "Ireland",
          game: "Gipf",
          bought: "✖️",
          balance: "$50,000",
          rating: "★★★★",
          winnings: "$7,000",
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
        {
          id: 14,
          names: "Amelia Cage",
          language: "English",
          country: "Ireland",
          game: "Shogi",
          bought: "✔️",
          balance: "$65,500",
          rating: "★★★",
          winnings: "$19,000",
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
        {
          id: 15,
          names: "Jessica Carson",
          language: "Swedish",
          country: "Sweden",
          game: "Mad Gab",
          bought: "✔️",
          balance: "$85,609",
          rating: "★★★★",
          winnings: "$6,000",
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
    updateUpperTableHeaders() {
      this.upperColumnWidths = this.upperTableHeaders.map(
        (header) => header[1]
      );
    },
    updateTableHeaders() {
      const newOrder = this.upperTableHeaders
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
    mounted() {
      window.addEventListener("resize", () => {
        this.tableWidth = window.innerWidth;
      });
    },
    onClickHeader(header) {
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
  components: {
    draggable,
  },
  created() {
    // make a copy of the original table data
    this.originalTableData = JSON.parse(JSON.stringify(this.tableData));
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
  scrollbar-color: rgba(0, 0, 0, 0.4) rgba(255, 255, 255, 0.1);
}

/* Change the scrollbar width and color for WebKit-based browsers */
.table-responsive::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  background-color: 39304e (255, 255, 255, 0.1);
}

.table-responsive::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.4);
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
  height: 4.5vh;
  line-height: 0.5; /* Add this line to adjust line-height */
  white-space: nowrap; /* Add this line to prevent text wrapping */
  text-overflow: ellipsis; /* Add this line to indicate truncated text */
}
.custom-table .handle:active {
  position: relative;
  z-index: 0;
  cursor: grabbing;
}
.custom-table .handle:hover {
  position: relative;
  background-color: #323346;
  color: #ffffff;
  z-index: 0;
}

tbody tr:nth-child(2n) {
  background-color: #24263a;
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
