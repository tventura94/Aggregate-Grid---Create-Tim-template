<template>
  <tr
    class="table-row flex-table-row"
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
</template>

<script>
export default {
  props: [
    "item",
    "tableHeaders",
    "checkedHeaders",
    "tableInEditMode",
    "getAlignment",
    "enableEditing",
    "disableEditing",
    "dragOptions",
  ],
  methods: {},
};
</script>
