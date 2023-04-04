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
                  :style="{ width: `100%` }"
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
                      class="handle subHeader th-border"
                      id="tableheader"
                      v-for="header in tableHeaders"
                      :key="header"
                      @click="sortHeadersClick(header)"
                      v-if="checkedHeaders.includes(header) && !tableInEditMode"
                    >
                      <div class="original-header-div">
                        {{ header }}
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
                      </div>
                      <div class="search-box">
                        <div>
                          <input
                            class="search-input"
                            v-model="searchQuery[header]"
                            type="text"
                            @click.stop
                          />
                        </div>
                        <div>
                          <i
                            @click.stop="openFilterMenu(header)"
                            class="fa fa-filter filter-btn-icon"
                          ></i>
                        </div>
                      </div>
                    </th>
                  </transition-group>
                </draggable>
              </tr>
            </thead>
            <transition name="fade">
              <div
                ref="openFilter"
                class="open-filter"
                v-if="filterButtonVisible && selectedHeader"
                v-for="header in tableHeaders"
              >
                <input
                  class="filter-search-input"
                  v-model="searchQuery[header]"
                  type="text"
                  @click.stop
                  placeholder="Search..."
                />
                <div v-for="value in uniqueValues" :key="value">
                  <input
                    type="checkbox"
                    :value="value"
                    :checked="value"
                    ref="myCheckbox"
                    @input="toggleSelectedValues(value)"
                  />
                  {{ value }}
                </div>
              </div>
            </transition>
            <!--------------------Original table------------------>

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
                    :options="{ handle: '.handle', ...dragOptions }"
                  >
                    <td
                      id="original-table-data"
                      class="flex-table-cell"
                      tabindex="0"
                      v-for="header in tableHeaders"
                      :key="header"
                      v-if="checkedHeaders.includes(header) && !tableInEditMode"
                      :style="getAlignment(header)"
                      @dblclick="enableEditing(item, header)"
                    >
                      <input
                        v-if="item.editing && item.editingField === header"
                        v-model="item[header.toLowerCase()]"
                        @blur="disableEditing(item)"
                        @keydown.enter.prevent="disableEditing(item)"
                        ref="editableInput"
                        class="edit-input-cell"
                      />
                      <template v-else>
                        <i
                          v-if="header === tableHeaders[0]"
                          class="fas fa-bars handle dragHandler"
                        ></i>
                        {{
                          header.toLowerCase() === "bought"
                            ? item[header.toLowerCase()] === "true"
                              ? "✔️"
                              : "✖️"
                            : header.toLowerCase() === "rating"
                            ? getStars(item[header.toLowerCase()])
                            : item[header.toLowerCase()]
                        }}
                      </template>
                    </td>
                  </tr>
                </transition-group>
              </draggable>
            </tbody>

            <!-- TABLE EDIT MODE -->

            <div class="editModeTable" v-if="tableInEditMode">
              <thead>
                <tr>
                  <div>
                    <draggable
                      v-model="editTableHeaders"
                      :options="{ handle: '.handle' }"
                      :group="{ name: 'tableHeadersGroup' }"
                      @add="onAddEditHeader"
                      class="drop-container"
                    >
                      <div
                        v-if="tableHeaders.length === 20"
                        class="placeholder-text"
                      >
                        Drag and drop headers here
                      </div>
                      <th
                        class="handle edit-subHeader custom-width"
                        id="tableheader"
                        v-for="header in editTableHeaders"
                        @click="sortHeadersClick(header)"
                        v-if="
                          checkedHeaders.includes(header) && tableInEditMode
                        "
                        v-show="displayHeaders.includes(header)"
                      >
                        Grouping by {{ header }}
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
                        <input
                          class="search-input-edit"
                          v-model="searchQuery[header]"
                          type="text"
                          @click.stop
                        />
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
                            class="fas fa-bars handle editHandleBars"
                          ></i>
                          {{
                            header.toLowerCase() === "bought"
                              ? item[header.toLowerCase()] === "true"
                                ? "✔️"
                                : "✖️"
                              : header.toLowerCase() === "rating"
                              ? getStars(item[header.toLowerCase()])
                              : item[header.toLowerCase()]
                          }}

                          <button
                            class="sleek-button"
                            @click="rowDropDownHandler(index)"
                          >
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
                            v-for="header in nestedHeaders"
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

      <!-- GROUP MODE CONTROLLER -->

      <div class="pivot-mode">
        <tr>
          <draggable
            v-model="tableHeaders"
            :options="{ handle: '.handle' }"
            :group="{ name: 'tableHeadersGroup', pull: 'clone', put: false }"
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
                :disabled="dragged"
              >
                {{ header }}

                <input
                  type="checkbox"
                  :value="header"
                  @input="toggleColumn(header)"
                  :checked="checkedHeaders.includes(header)"
                  v-if="header"
                  :disabled="shouldDisableCheckboxes"
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
              <th>
                {{ tableInEditMode ? "Return to table" : " Group Mode" }}
              </th>
            </div>
          </div>
          <div class="dragable" v-if="!tableInEditMode">
            <draggable
              v-model="upperTableHeaders"
              :options="{ handle: '.handle' }"
              @change="updateTableHeaders"
              :group="{
                name: 'upperTableHeadersGroup',
                put: false,
              }"
              :disabled="tableInEditMode"
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
                >
                  {{ header[0] }}

                  <input
                    type="checkbox"
                    :value="header[0]"
                    @input="toggleUpperColumn(header[0])"
                    :checked="checkedUpperHeaders.includes(header[0])"
                    :disabled="tableInEditMode"
                  />
                </th>
              </transition-group>
            </draggable>
          </div>

          <!-- GROUP MODE CONTROLLER IN EDIT MODE -->

          <div
            class="dragable"
            :style="{ opacity: 0.4 }"
            v-if="tableInEditMode"
          >
            <draggable
              v-model="upperTableHeaders"
              :options="{ handle: '.handle' }"
              @change="updateTableHeaders"
              :group="{
                name: 'upperTableHeadersGroup',
                put: false,
              }"
              :disabled="tableInEditMode"
            >
              <transition-group
                tag="tbody"
                type="transition"
                :name="!drag ? 'flip-list' : null"
              >
                <th
                  class="handle pivot-mode shake"
                  v-for="header in upperTableHeaders"
                  :key="header[0]"
                  draggable="true"
                >
                  {{ header[0] }}
                  <input
                    type="checkbox"
                    :value="header[0]"
                    :disabled="tableInEditMode"
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
import jsonData from "../jsonData";
export default {
  data() {
    return {
      selectedValues: [],
      selectedHeader: null,
      filterButtonVisible: false,
      infoPopoutVisible: false,
      errorMessage: null,
      dragged: false,
      draggedHeaderData: null,
      filteredData: [],
      checkedData: [],
      nestedHeaders: [],
      displayHeaders: [],
      draggedColumnsData: [],
      rowToShow: null,
      rowDropDown: false,
      upperPivotTableHeaders: [],
      pivotTableHeaders: [],
      upperEditTableHeaders: [],
      editTableHeaders: [],
      tableInEditMode: false,
      checkedUpperHeaders: [],
      checkedHeaders: [],
      originalCheckedHeaders: [],
      originalCheckedUpperHeaders: [],
      searchQuery: {},
      sortOrder: {},
      originalTableData: [],
      drag: false,
      upperTableHeaders: [
        ["Participants", 15],
        ["Game of Choice", 10],
        ["Performance", 10],
        ["Budget", 65],
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
        Performance: ["Balance", "Rating"],
        Budget: [
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
      },
      tableData: jsonData,
    };
  },
  computed: {
    filteredTableDataEdit() {
      return this.tableData.filter((row) =>
        this.selectedValues.includes(row.game)
      );
    },
    shouldDisableCheckboxes() {
      return this.tableInEditMode && !this.dragged;
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
        // Search functionality
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

        // Filter functionality
        if (this.selectedValues.length === 0) {
          return true;
        } else {
          return !this.selectedValues.includes(
            item[this.selectedHeader.toLowerCase()]
          );
        }
      });
    },
    uniqueValues() {
      if (!this.selectedHeader) {
        return [];
      }
      const key = this.selectedHeader.toLowerCase();
      const values = this.tableData.map((row) => row[key]);
      return [...new Set(values)];
    },
  },
  methods: {
    toggleSelectedValues(value) {
      if (this.selectedValues.includes(value)) {
        this.selectedValues = this.selectedValues.filter(
          (selectedValue) => selectedValue !== value
        );
      } else {
        this.selectedValues.push(value);
      }
    },
    openFilterMenu(header) {
      this.selectedHeader = header;
      this.filterButtonVisible = !this.filterButtonVisible;
    },
    getStars(rating) {
      let stars = "";
      const numberOfStars = parseInt(rating);
      for (let i = 0; i < numberOfStars; i++) {
        stars += "★";
      }
      return stars;
    },

    getAlignment(header) {
      if (["Names", "Country", "Game", "Language"].includes(header)) {
        return { textAlign: "left", paddingLeft: "25px" };
      } else if (["Bought", "Rating", "Balance"].includes(header)) {
        return { textAlign: "center", paddingRight: "10px" };
      } else if (
        [
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
        ].includes(header)
      ) {
        return { textAlign: "right", paddingRight: "2rem" };
      }
    },

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
      sessionStorage.setItem("tableData", JSON.stringify(this.tableData));
      this.originalTableData = JSON.parse(JSON.stringify(this.tableData));
    },

    hideOriginalData(elementId) {
      let data = document.getElementById(elementId);
      if (data) {
        data.style.display = "none";
      }
    },

    onAddEditHeader(event) {
      if (this.displayHeaders.length > 0) {
        return;
      }

      this.errorMessage = null;
      this.dragged = true;
      const addedHeader = this.editTableHeaders[event.newIndex];
      const originalIndex = this.tableHeaders.indexOf(addedHeader);

      this.displayHeaders.push(addedHeader);
      this.nestedHeaders.push(addedHeader);
      this.draggedHeaderData = addedHeader;
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

      // Merge rows with the same content in the added column
      this.mergeRows(addedHeader);
    },

    mergeRows(addedHeader) {
      const headerKey = addedHeader.toLowerCase();
      const mergedTableData = this.tableData.reduce((accumulator, row) => {
        const existingIndex = accumulator.findIndex(
          (accRow) => accRow[headerKey] === row[headerKey]
        );

        if (existingIndex > -1) {
          this.tableHeaders.forEach((header) => {
            const currentHeaderKey = header.toLowerCase();
            if (
              currentHeaderKey !== headerKey &&
              !accumulator[existingIndex][currentHeaderKey].includes(
                row[currentHeaderKey]
              )
            ) {
              accumulator[existingIndex][currentHeaderKey] =
                accumulator[existingIndex][currentHeaderKey] +
                ", " +
                row[currentHeaderKey];
            }
          });
        } else {
          accumulator.push(row);
        }
        return accumulator;
      }, []);

      this.tableData = mergedTableData;
    },

    toggleTableEditMode() {
      this.tableInEditMode = !this.tableInEditMode;
      if (!this.tableInEditMode && this.draggedHeaderData) {
        this.displayHeaders.push(this.draggedHeaderData);
        this.draggedHeaderData = null;
      }
      if (this.tableInEditMode) {
        // Store original checked headers when entering edit mode
        this.originalCheckedHeaders = [...this.checkedHeaders];
        this.originalCheckedUpperHeaders = [...this.checkedUpperHeaders];

        // Clear checkedHeaders and checkedUpperHeaders
        this.checkedHeaders = [];
        this.checkedUpperHeaders = [];

        // Reset displayHeaders
        this.displayHeaders = [];
      } else {
        // Restore original checked headers when exiting edit mode
        this.checkedHeaders = [...this.originalCheckedHeaders];
        this.checkedUpperHeaders = [...this.originalCheckedUpperHeaders];
        this.tableHeaders = [...this.checkedHeaders];

        // Reset nestedHeaders
        this.nestedHeaders = [...this.originalCheckedHeaders];

        this.restoreOriginalTableData();
      }
    },

    restoreOriginalTableData() {
      this.tableData = JSON.parse(JSON.stringify(this.originalTableData));
    },

    toggleColumn(header) {
      const index = this.checkedHeaders.indexOf(header);
      if (index === -1) {
        this.checkedHeaders.push(header);
      } else {
        this.checkedHeaders.splice(index, 1);
      }
    },
    toggleData(value) {
      const index = this.selectedValues.indexOf(value);
      if (index === -1) {
        this.selectedValues.push(value);
      } else {
        this.selectedValues.splice(index, 1);
      }
    },

    filterData() {
      // Filter tableData based on checkedData and update filteredData
      this.filteredData = this.tableData.filter((row) =>
        this.checkedData.every((header) => row[header] === true)
      );
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
    this.filteredData = this.tableData.slice();
  },
  watch: {
    tableInEditMode(newVal) {
      if (newVal) {
        this.filterButtonVisible = false;
      }
    },
  },
  components: {
    draggable,
  },
};
</script>

<style>
.edit-input-cell {
  width: 7.5rem;
  color: rgb(239, 239, 239);
  background-color: #27293d;
}

.drop-container {
  margin: 0 auto;
  min-height: 70px;
  min-width: 67.5vw; /* Adjust the height as needed */
  border: 2px dashed #505d6d; /* Add a dashed border to indicate it's a drop area */
  color: white;
  background-color: #292e40; /* Add a background color to make it more visible */
}
.placeholder-text {
  text-align: center;
  padding-top: 0.8rem;
  color: #b1a5c4;
  font-style: italic;
}

.edit-subHeader {
  display: flex;
  flex-direction: column;
  border-bottom: none;
}
.tableEditRow .flex-table-cell {
  display: flex;
  flex-direction: column;
  text-align: left;
  align-items: flex-start;
  justify-content: flex-start; /* Add this line */
  margin-left: 13rem;
}
.tableEditRow .flex-table-cell:nth-child(even) {
  margin-left: 1.5rem;
}
.tableEditRow .flex-table-cell:nth-child(odd) {
  margin-left: 3rem;
}
.tableEditRow .flex-table-cell:first-child {
  margin-left: 0rem;
}
.tableEditRow .flex-table-cell:nth-child(n + 4) {
  margin-left: 4.5rem;
}
.tableEditRow .flex-table-cell:nth-child(n + 5) {
  margin-left: 6rem;
}
.tableEditRow .flex-table-cell:nth-child(n + 6) {
  margin-left: 7.5rem;
}
.tableEditRow .flex-table-cell:nth-child(n + 7) {
  margin-left: 9rem;
}
.tableEditRow .flex-table-cell:nth-child(n + 8) {
  margin-left: 10.5rem;
}

tbody tr:nth-child(even) {
  background-color: #242638;
}

.original-table tr:hover {
  background-color: #2b3043cf;
}
.parent {
  border-radius: 5px;
  width: 100%;
}
.dragHandler {
  margin-left: -0.5rem;
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

.search-box {
  display: flex;
  flex-direction: row;
}
.filter-btn-icon {
  margin-top: 2.5rem;
  margin-left: 0.5rem;
  width: 0px;
  height: 0px;
  color: #4b5268;
  transition: color ease-in 0.13s;
  font-size: 13px;
  padding-left: 10px;
  padding-right: 10px;
}
.filter-btn-icon:hover {
  color: #3b9d6d;
  font-size: 12px;
}

.filter-btn-icon-open {
  width: 0px;
  height: 0px;
  color: #4b5268;
  font-size: 13px;
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
.th-resizer {
  display: inline-block;
  width: 5px;
  height: 100%;
  cursor: col-resize;
  position: absolute;
  right: 0;
  top: 0;
}
.flip-list-enter-active,
.flip-list-leave-active {
  transition: transform 0.5s, opacity 0.5s;
}
.flip-list-enter,
.flip-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
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
  font-weight: 600;
  border-top: none;
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
  text-align: center;
  border-top: none;
  border-left: none;

  padding-top: 1rem;
}
.custom-table .subHeader:nth-child(n + 8) {
  text-align: right;
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

.filter-btn-icon {
  font-size: smaller;
}

i {
  margin-right: 0.7rem;
  font-size: larger;
}
.editicon {
  position: fixed;
  bottom: 83%;
  left: 95%;
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
  min-width: 8.5vw;
}

.flex-table-cell:nth-child(n + 2):focus {
  border: 1px solid #e642d8a9;
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
  width: 8rem;
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
.search-input-edit:focus {
  outline: none;
  border-color: #e44cc4;
}

.search-input-edit {
  width: 180px;
  height: 30px;
  margin: 0 auto;
  margin-top: 1rem;

  margin-bottom: 0.33rem;
  border: 1px solid #2b3553;
  border-radius: 5px;
  background-color: #27293d;
  transition: border-color 0.3s ease-in-out;
  caret-color: white;
  color: white;
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

.sleek-button {
  background-color: transparent;
  border: none;
  color: #37394f; /* Change this to the desired text color */
  font-size: 16px;
  cursor: pointer;
  outline: none;
  transition: 0.3s;
}

.sleek-button:hover {
  color: #3fac7a;
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
  padding-right: 150rem;
}

.header .editHandleBars {
  margin-right: 2rem;
  margin-left: 2rem;
}
.th-border:not(:first-child)::after {
  content: "";
  position: absolute;
  top: 2.8vh;
  left: -9px;
  height: 18px;
  width: 2px;
  background-color: #686b88;
  transform: translateY(-50%);
}
.original-header-div {
  padding-right: 8px;
}
.filter-search-input {
  margin-bottom: 0.3rem;
}
.open-filter {
  display: flex;
  position: fixed;
  z-index: 2;
  flex-direction: column;
  border: 1px #676176 solid;
  border-top: none;
  padding: 10px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  background-color: #27293d;

  box-shadow: -8px 21px 29px -18px rgba(28, 27, 27, 0.29);
  -webkit-box-shadow: -8px 21px 29px -18px rgba(28, 27, 27, 0.29);
  -moz-box-shadow: -8px 21px 29px -18px rgba(28, 27, 27, 0.29);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.th-border:nth-child(n + 9)::after {
  content: "";
  position: absolute;
  top: 2.8vh;
  left: -9px;
  height: 30px;
  width: 2px;
  background-color: #686b88;
  transform: translateY(-50%);
}

.shake:active {
  transform-origin: center center;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(2px);
  }
}
</style>
