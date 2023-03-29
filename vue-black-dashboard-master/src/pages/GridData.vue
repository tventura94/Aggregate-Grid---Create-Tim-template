<template>
  <div class="parent">
    <div class="content-container">
      <div
        class="card card-grid"
        :class="{
          'table-responsive': !tableInEditMode,
          'table-responsive-no-scroll': tableInEditMode,
          'table-container': tableInEditMode,
        }"
      >
        <div>
          <table class="table custom-table">
            <thead v-if="!tableInEditMode" class="sticky-headers">
              <tr>
                <draggable
                  class="upperTable"
                  v-model="upperTableHeaders"
                  :options="{ handle: '.handle', ...dragOptions }"
                  :style="{ width: `${tableWidth}px` }"
                  @change="updateTableHeaders"
                >
                  <transition-group
                    tag="thead"
                    type="transition"
                    :name="!drag ? 'flip-list' : null"
                    class="upperTableWidth"
                  >
                    <th
                      class="handle upperHeader"
                      v-for="header in upperTableHeaders"
                      :key="header[0]"
                      :style="{ width: `${header[1]}%` }"
                      v-if="checkedUpperHeaders.includes(header[0])"
                    >
                      {{ header[0] }}
                    </th>
                  </transition-group>
                </draggable>
              </tr>
              <tr>
                <draggable
                  v-model="tableHeaders"
                  :options="{ handle: '.handle' }"
                >
                  <transition-group
                    tag="thead"
                    type="transition"
                    :name="!drag ? 'flip-list' : null"
                  >
                    <th
                      class="handle subHeader"
                      id="tableheader"
                      v-for="header in tableHeaders"
                      :key="header"
                      @click="sortHeadersClick(header)"
                      v-if="checkedHeaders.includes(header) && !tableInEditMode"
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
                        <span v-if="sortOrder[header] === 'desc'"
                          >&#x25BC;</span
                        >
                      </transition>
                    </th>
                  </transition-group>
                </draggable>
              </tr>
            </thead>

            <tbody class="original-table" v-if="!tableInEditMode">
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
                    class="table-row flex-table-row"
                    v-for="item in filteredTableData"
                    :key="item.id"
                  >
                    <td
                      id="original-table-data"
                      class="flex-table-cell"
                      v-for="header in tableHeaders"
                      :key="header"
                      v-if="checkedHeaders.includes(header) && !tableInEditMode"
                      :style="{ width: `${header[1]}%` }"
                      @dblclick="enableEditing(item, header)"
                      :id="`original-table-data-${itemIndex}-${index}`"
                    >
                      <input
                        v-if="item.editing && item.editingField === header"
                        v-model="item[header.toLowerCase()]"
                        @blur="disableEditing(item)"
                        @keydown.enter.prevent="disableEditing(item)"
                        ref="editableInput"
                      />
                      <!-- Add the drag handle with the 'drag-handle' class -->
                      <i
                        v-if="header === tableHeaders[0]"
                        class="fas fa-bars handle"
                      ></i>

                      {{ item[header.toLowerCase()] }}
                    </td>
                  </tr>
                </transition-group>
              </draggable>
            </tbody>

            <!-- TABLE EDIT MODE -->

            <div class="editModeTable" v-if="tableInEditMode">
              <thead>
                <tr class="secondrow">
                  <div class="header-container">
                    <draggable
                      v-model="editTableHeaders"
                      :options="{ handle: '.handle' }"
                      :group="{ name: 'tableHeadersGroup' }"
                      :style="{ width: `${tableWidth}px` }"
                      @add="onAddEditHeader"
                    >
                      <th
                        class="handle subHeader"
                        id="tableheader"
                        v-for="header in editTableHeaders"
                        :key="header"
                        :style="{ width: `52.9rem` }"
                        @click="sortHeadersClick(header)"
                        v-if="
                          checkedHeaders.includes(header) && tableInEditMode
                        "
                        v-show="displayHeaders.includes(header)"
                      >
                        Grouping by {{ header }}
                        <input
                          class="search-input"
                          v-model="searchQuery[header]"
                          type="text"
                          @click.stop
                        />
                        <transition name="fade">
                          <span v-if="sortOrder[header] === 'asc'"
                            >&#x25B2;</span
                          >
                        </transition>
                        <transition name="fade">
                          <span v-if="sortOrder[header] === 'desc'"
                            >&#x25BC;</span
                          >
                        </transition>
                      </th>
                    </draggable>
                  </div>
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
                    <template v-for="(item, index) in filteredTableData">
                      <tr class="table-row flex-table-row" :key="item.id">
                        <td
                          class="flex-table-cell"
                          v-for="header in displayHeaders"
                          :key="header"
                          v-if="
                            checkedHeaders.includes(header) && tableInEditMode
                          "
                          :style="{ width: `${header[1]}%` }"
                        >
                          <i
                            v-if="header === displayHeaders[0]"
                            class="fas fa-bars handle"
                          ></i>
                          {{ item[header.toLowerCase()] }}

                          <button @click="rowDropDownHandler(index)">
                            &#x25BC;
                          </button>
                        </td>
                      </tr>

                      <!-- DROP DOWN ROWS in Table Edit Mode -->
                      <tr
                        class="tableEditRow"
                        v-if="rowToShow === index"
                        :key="item.id + '-dropdown'"
                      >
                        <draggable
                          v-model="editTableHeaders"
                          :options="{ handle: '.handle' }"
                          :group="{ name: 'tableHeadersGroup' }"
                          @add="onAddEditHeader"
                        >
                          <td
                            class="flex-table-cell"
                            v-for="(header, nestedIndex) in nestedHeaders"
                            :key="header"
                            v-if="
                              checkedHeaders.includes(header) &&
                              tableInEditMode &&
                              header !== draggedHeaderData
                            "
                            :style="{ width: `${header[1]}%` }"
                          >
                            {{ item[header.toLowerCase()] }}
                          </td>
                        </draggable>
                      </tr>
                    </template>
                  </transition-group>
                </draggable>
              </tbody>
            </div>
          </table>
        </div>
      </div>

      <!-- PIVOT MODE -->

      <div class="pivot-mode">
        <tr>
          <draggable
            v-model="tableHeaders"
            :options="{ handle: '.handle' }"
            :group="{ name: 'tableHeadersGroup', pull: 'clone', put: true }"
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
                draggable="true"
                @dragstart="onDragStart($event, header)"
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
          <div class="groupModeButton-container">
            <div class="flexEnd">
              <i
                @click="toggleTableEditMode()"
                :class="{ active: tableInEditMode }"
                class="fas fa-layer-group grid-object"
              ></i>
              <th>Group Mode</th>
            </div>
          </div>
          <div class="dragable">
            <draggable
              v-model="upperTableHeaders"
              :options="{ handle: '.handle' }"
              @change="updateTableHeaders"
              :group="{
                name: 'upperTableHeadersGroup',
                pull: 'clone',
                put: false,
              }"
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
                  draggable="true"
                  @dragstart="onDragStart($event, header[0])"
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
          </div>
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
      draggedHeader: "",
      draggedHeaderData: null,
      nestedHeaders: [],
      displayHeaders: [],
      draggedColumnsData: [],
      rowToShow: null,
      rowDropDown: false,
      displayHeaders: [],
      upperPivotTableHeaders: [],
      upperEditTableHeaders: [],
      editTableHeaders: [],
      pivotTableHeaders: [],
      tableInEditMode: false,
      checkedUpperHeaders: [],
      checkedHeaders: [],
      originalCheckedHeaders: [],
      originalCheckedUpperHeaders: [],
      tableWidth: ["2116"],
      drag: false,
      draggedHeader: null,
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
      draggedHeaderIndex: -1,
      searchQuery: {},
      sortOrder: {},
      originalTableData: [],
    };
  },
  computed: {
    headers() {
      return this.tableInEditMode ? this.pivotTableHeaders : this.tableHeaders;
    },
    upperHeaders() {
      return this.tableInEditMode
        ? this.upperPivotTableHeaders
        : this.upperTableHeaders;
    },

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
    rowDropDownHandler(index) {
      this.rowToShow = this.rowToShow === index ? null : index;
      this.rowDropDown = !this.rowDropDown;
      if (this.rowDropDown) {
        const rowData = this.filteredTableData[index];
        this.draggedColumnsData = this.tableHeaders.map((header) => ({
          header,
          value: rowData[header.toLowerCase()],
        }));
      }
    },
    enableEditing(item, header, elementId) {
      this.$set(item, "editing", true);
      this.$set(item, "editingField", header);
      this.$nextTick(() => {
        this.$refs.editableInput[0].focus();
      });
      this.hideOriginalData(elementId);
    },
    disableEditing(item) {
      this.$set(item, "editing", false);
      this.$set(item, "editingField", null);
    },
    hideOriginalData(elementId) {
      let data = document.getElementById(elementId);
      if (data) {
        data.style.display = "none";
      }
    },

    removeColumn(header) {
      for (let i = 0; i < this.tableData.length; i++) {
        const item = this.tableData[i];
        delete item[header.toLowerCase()];
      }
    },
    onAddEditHeader(event) {
      const addedHeader = this.editTableHeaders[event.newIndex];
      const originalIndex = this.tableHeaders.indexOf(addedHeader);

      if (!this.displayHeaders.includes(addedHeader)) {
        this.displayHeaders.push(addedHeader);
        this.nestedHeaders.push(addedHeader); // Add the header to nestedHeaders
        this.editTableHeaders.splice(event.newIndex, 1);
        this.tableHeaders.splice(originalIndex, 1);
      } else {
        this.editTableHeaders.splice(event.newIndex, 1);
      }
    },
    onAddNestedEditHeader(event) {
      const addedHeader = this.editTableHeaders[event.newIndex];
      const originalIndex = this.tableHeaders.indexOf(addedHeader);

      if (!this.displayHeaders.includes(addedHeader)) {
        this.displayHeaders.push(addedHeader);
        this.editTableHeaders.splice(event.newIndex, 1);
        this.tableHeaders.splice(originalIndex, 1);

        // Add the associated 'td' elements for each row in the table
        this.tableData.forEach((row) => {
          row.nestedTdData = row.nestedTdData || {};
          row.nestedTdData[addedHeader] = row[addedHeader.toLowerCase()];
        });
      } else {
        this.editTableHeaders.splice(event.newIndex, 1);
      }
    },
    onAddEditHeader(event) {
      const addedHeader = this.editTableHeaders[event.newIndex];
      const originalIndex = this.tableHeaders.indexOf(addedHeader);

      if (!this.displayHeaders.includes(addedHeader)) {
        this.displayHeaders.push(addedHeader);
        this.nestedHeaders.push(addedHeader); // Add the header to nestedHeaders
        this.draggedHeaderData = addedHeader; // Store the dragged header data
        this.editTableHeaders.splice(event.newIndex, 1);
        this.tableHeaders.splice(originalIndex, 1);

        // Check the dragged header
        if (!this.checkedHeaders.includes(addedHeader)) {
          this.checkedHeaders.push(addedHeader);
        }
        // Check the associated upper header if not already checked
        const upperHeader = this.upperTableHeaders.find(
          (upper) =>
            upper[0] in this.tableHeaderMap &&
            this.tableHeaderMap[upper[0]].includes(addedHeader)
        );
        if (upperHeader && !this.checkedUpperHeaders.includes(upperHeader[0])) {
          this.checkedUpperHeaders.push(upperHeader[0]);
        }
      } else {
        this.editTableHeaders.splice(event.newIndex, 1);
      }
    },
    removeFromTableHeaders(header) {
      const index = this.tableHeaders.indexOf(header);
      if (index !== -1) {
        this.tableHeaders.splice(index, 1);
      }
    },
    toggleTableEditMode() {
      this.tableInEditMode = !this.tableInEditMode;
      if (this.tableInEditMode) {
        // Store original checked headers when entering edit mode
        this.originalCheckedHeaders = [...this.checkedHeaders];
        this.originalCheckedUpperHeaders = [...this.checkedUpperHeaders];

        // Clear checkedHeaders and checkedUpperHeaders
        this.checkedHeaders = [];
        this.checkedUpperHeaders = [];
      } else {
        // Restore original checked headers when exiting edit mode
        this.checkedHeaders = [...this.originalCheckedHeaders];
        this.checkedUpperHeaders = [...this.originalCheckedUpperHeaders];
      }
    },

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

      // adjust width of checked headers
      const totalWidth = this.upperTableHeaders
        .filter((header) => this.checkedUpperHeaders.includes(header[0]))
        .reduce((sum, header) => sum + header[1], 0);

      this.upperTableHeaders.forEach((header) => {
        if (this.checkedUpperHeaders.includes(header[0])) {
          header[1] = Math.round((header[1] / totalWidth) * 10000) / 100;
        }
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

    updateEditTableHeaders() {
      const newOrder = this.upperEditTableHeaders
        .filter((header) => this.checkedUpperHeaders.includes(header[0]))
        .map((header) => {
          if (header[0] in this.tableHeaderMap) {
            return this.tableHeaderMap[header[0]];
          } else {
            return [header[0]];
          }
        })
        .flat();
      this.editTableHeaders = newOrder;
    },

    sortHeadersClick(header) {
      if (!header) {
        return;
      }
      const isMoneyColumn = this.tableData.some((row) =>
        /^\$[\d,]+$/.test(row[header.toLowerCase()])
      );
      const moneyStringToNumber = (moneyString) =>
        parseFloat(moneyString.replace(/[$,]/g, ""));

      const sortRows = (a, b) => {
        const aValue = a[header.toLowerCase()];
        const bValue = b[header.toLowerCase()];

        Object.keys(this.sortOrder).forEach((key) => {
          if (key !== header) {
            this.sortOrder[key] = null;
          }
        });
        if (isMoneyColumn) {
          return moneyStringToNumber(aValue) - moneyStringToNumber(bValue);
        }
        return aValue.localeCompare(bValue);
      };
      if (
        this.sortOrder[header] !== "asc" &&
        this.sortOrder[header] !== "desc"
      ) {
        this.sortOrder[header] = "asc";
      } else {
        this.sortOrder[header] =
          this.sortOrder[header] === "asc" ? "desc" : null;
      }

      if (this.sortOrder[header]) {
        this.tableData.sort((a, b) => {
          const sortResult = sortRows(a, b);
          return this.sortOrder[header] === "asc" ? sortResult : -sortResult;
        });
      } else {
        this.tableData = JSON.parse(JSON.stringify(this.originalTableData));
        return;
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
    this.pivotTableHeaders = this.tableHeaders.slice();
    this.editTableHeaders = this.tableHeaders.slice();
    this.upperPivotTableHeaders = this.upperTableHeaders.slice();
    this.upperEditTableHeaders = this.upperTableHeaders.slice();
    this.nestedHeaders = this.tableHeaders.slice();
  },
  components: {
    draggable,
  },
};
</script>

<style>
.tableEditRow .flex-table-cell {
  display: flex;
  flex-direction: column;
  text-align: left;
  align-items: flex-start;
  justify-content: flex-start; /* Add this line */
  margin-left: 1.5rem;
}
tbody tr:nth-child(even) {
  background-color: #242638;
}
.parent {
  border-radius: 5px;
}
.trows {
  height: 10.3vh;
  background-color: #2b2d41;
}
.upper-trows {
  height: 7.3vh;
  border-bottom: 1px solid #415b7b;
  background-color: #2b2d41;
}

.vertical-header {
  display: flex;
  flex-direction: column;
}

.swapping {
  transition: all 0.3s ease-in-out;
}
.card-grid {
  height: 85vh;
  width: 68vw;
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
.table-responsive-no-scroll {
  width: 100vw;
  display: block;
}
.custom-table td,
.custom-table th {
  transition: all 0.3s ease-in-out;
  text-align: center;
  vertical-align: middle;
  font-size: 13px;
  table-layout: auto;
  padding: 8px;
  width: 100vw;
  border-bottom: #39304e 1px solid;
}
.table.custom-table th {
  border-bottom: #676176 1px solid;
}
.table.custom-table td {
  border-top: none;
}

.custom-table .upperHeader {
  display: flex;
  justify-content: center;
  align-items: center;
  align-items: center;
  justify-content: center;
  height: 50px;
  border-top: none;

  border-left: none;
  border-bottom: none;
  border-radius: 5px 5px 0 0;
  box-shadow: 6px -1px 9px 0px rgba(0, 0, 0, 0.17);
  -webkit-box-shadow: 6px -1px 9px 0px rgba(0, 0, 0, 0.17);
  -moz-box-shadow: 6px -1px 9px 0px rgba(0, 0, 0, 0.17);
}
.upperTableWidth {
  display: flex;
  width: 100%;
}
.custom-table .subHeader {
  justify-content: center;
  align-items: center;
  align-items: center;
  justify-content: center;
  border-top: none;
  border-left: none;

  padding-top: 1rem;
}
.custom-table td {
  padding-top: 1rem;
  padding-bottom: 1rem;
  min-width: 4, 5vw;
  overflow: hidden;
  padding-left: 0.1rem;
  padding-right: 0.1rem;
  justify-content: center;
  align-items: center;
  align-self: center;
  height: 4.5vh;
  line-height: 0.5; /* Add this line to adjust line-height */
  white-space: nowrap; /* Add this line to prevent text wrapping */
  text-overflow: ellipsis; /* Add this line to indicate truncated text */
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-align: start;
  padding-left: 1rem;
  color: rgb(129, 133, 165);
}

i {
  margin-right: 0.7rem;
  font-size: larger;
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

.flex-table-row {
  width: 100vw;
}
.table-container {
  overflow-x: auto;
  overflow-y: auto;
  position: sticky;
  top: 0;
  z-index: 1;
  opacity: 1;
  background-image: linear-gradient(
    315deg,
    hsl(234deg 17% 25%) 0%,
    hsl(234deg 19% 22%) 35%,
    hsl(235deg 22% 20%) 100%
  );
  width: 100vw;
}
.table-container thead {
  color: #c5d6ce;
}
.table-container tbody {
  background-color: #27293d;
}
.table-container {
  /* Change the scrollbar width and color for Firefox */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.4) rgba(138, 33, 33, 0.1);
}

/* Change the scrollbar width and color for WebKit-based browsers */
.table-container::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  background-color: 39304e (255, 255, 255, 0.1);
}

.table-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.38);
  border-radius: 4px;
}
.table-container::-webkit-scrollbar-track {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.table-container-no-scroll {
  width: 100vw;
  display: block;
}

.flex-table-cell {
  min-width: 100px;
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
  margin-top: 2rem;
  margin-bottom: 0.33rem;
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
  width: 100%;
  box-shadow: -8px 21px 29px -18px rgba(28, 27, 27, 0.29);
  -webkit-box-shadow: -8px 21px 29px -18px rgba(28, 27, 27, 0.29);
  -moz-box-shadow: -8px 21px 29px -18px rgba(28, 27, 27, 0.29);
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
  opacity: 0;
  background-color: transparent;
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
  margin: 0.85rem;
  transition: all 0.3s ease-in-out;
  text-align: center;
  z-index: 1;
}

.pivot-mode th {
  display: flex;
  justify-content: space-between;
  padding-left: 4px;
  border: 1px solid #3c4663;
}

.pivot-mode th:hover {
  background-color: #37394f;
}

.editable-headers {
  position: sticky;
  top: 0;
}

input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 1px solid #7c84b8;
  background-color: #2b2e41;
  margin-right: 5px;
  transition: ease-in 0.2s;
}

input[type="checkbox"]:checked {
  background-color: #525670;
}

input[type="checkbox"]:hover {
  background-color: #3b9d6d;
}

input[type="checkbox"]:focus {
  outline: none;
  border: 2px solid #2b2e41;
}
.subHeader {
  position: relative;
}

.subHeader::before,
.subHeader::after {
  content: "";
  display: block;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 58px;
  height: 0.1px;
  background-color: #676176;
}

.subHeader::after {
  width: 90%;
  margin-left: 8px;
}

.grid-object {
  font-size: 35px;
}
.grid-object-font {
  position: relative;
  font-size: 15px;
  bottom: 15rem;
  left: 1.7rem;
}
.groupModeButton-container {
  position: relative;
  display: flex;
  bottom: 3rem;
  flex-direction: column;
  align-items: center;
}
.groupModeButton-container th {
  border: none;
  margin-right: 0.7rem;
  cursor: default;
}
.flexEnd {
  transition: color ease-in 0.15s;
}
.flexEnd:hover {
  color: #6aae8c;
  cursor: pointer;
}

.header-container th {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
</style>
