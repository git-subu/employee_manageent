<template>
  <div>
    <div class="container mt-5">
      <!-- Button to open modal -->
       <h2>Employee Management</h2>
       <br>
      <button style="margin-bottom: 7px;" class="btn btn-primary" @click="showModal">Add Employee</button>
      &nbsp; <input v-model="searchQuery" placeholder="Search employees..." />

      <!-- Add employee Modal -->
      <div
        ref="modalRef"
        class="modal fade"
        tabindex="-1"
        style="display: none"
        aria-labelledby="modalTitle"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <!--Header -->
            <div class="modal-header">
              <h5 class="modal-title" id="modalTitle">Add Employee</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <!--Body -->
            <div class="modal-body">
              <form @submit.prevent="isEdit ? updateEmp() : addData()">
                <div class="mb-3">
                  <label class="form-label">Employee No:</label>
                  <input
                    v-model="formData.empNo"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Name:</label>
                  <input
                    v-model="formData.empName"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Date of Birth:</label>
                  <input
                    v-model="formData.empDOB"
                    type="date"
                    class="form-control"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Age:</label>
                  <input
                    v-model="formData.empAge"
                    type="number"
                    class="form-control"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Date of Joining:</label>
                  <input
                    v-model="formData.DateofJoin"
                    type="date"
                    class="form-control"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Hike Percent:</label>
                  <input
                    v-model="formData.hikepercent"
                    type="number"
                    step="0.01"
                    class="form-control"
                    required
                  />
                </div>
                <button type="submit" class="btn btn-success">
                  {{ isEdit ? "Submit" : "Add Employee" }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Display data using table -->
<div class="container mt-5">
  <h2>Employee List</h2>
    <table :border="1">
      <thead>
        <tr>
          <th>Emp No</th>
          <th>Name</th>
          <th>DOB</th>
          <th>Age</th>
          <th>Date of Joining</th>
          <th>Hike %</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="employee in filteredEmployees" :key="employee.empNo">
          <td>{{ employee.empNo }}</td>
          <td>{{ employee.empName }}</td>
          <td>{{ formatDate(employee.empDOB) }}</td>
          <td>{{ employee.empAge }}</td>
          <td>{{ formatDate(employee.DateofJoin) }}</td>
          <td>{{ employee.hikepercent }}%</td>

          <td>
            <span @click="editEmp(employee)" style="cursor: pointer">Edit</span>
            &nbsp;
            <span @click="deleteData(employee.empNo)" style="cursor: pointer"
              >Delete</span
            >
          </td>
        </tr>
      </tbody>
    </table>
</div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
const employees = ref([]); // Store API data
import { Modal } from "bootstrap";
import axios from "axios"; // Import axios

const modalRef = ref(null);
const bootstrapModal = ref(null);

// Form data
const formData = ref({
  empNo: "",
  empName: "",
  empDOB: "",
  empAge: "",
  DateofJoin: "",
  hikepercent: "",
});
const searchQuery = ref("");
const isEdit = ref(false);

// Set value for modal on component mount
onMounted(() => {
  if (modalRef.value) {
    bootstrapModal.value = new Modal(modalRef.value);
  }
});

// Show modal
const showModal = () => {
  bootstrapModal.value.show();
  resetForm();
};

// Reset form data
const resetForm = () => {
  formData.value.empNo = "";
  formData.value.empName = "";
  formData.value.empAge = "";
  formData.value.empDOB = "";
  formData.value.DateofJoin = "";
  formData.value.hikepercent = "";
};

// Add Data - POST request
const addData = async () => {
  //Check for duplicate entries
  if (
    employees.value.some(
      (emp) =>
        emp.empName.toLowerCase() === formData.value.empName.toLowerCase()
    )
  ) {
    alert("Duplicate Employee Number! Please enter a unique empNo.");
    return;
  }
  // Use axios to add employee data
  try {
    await axios.post("http://localhost:5000/employees", formData.value);
    alert("Employee added successfully!");
    bootstrapModal.value.hide(); // Close modal after success
    fetchEmployees(); // Refresh employee list
  } catch (error) {
    console.error("Error adding employee:", error);
  }
};

// Fetch employee data
const fetchEmployees = async () => {
  try {
    const response = await fetch("http://localhost:5000/employees");
    employees.value = await response.json();
    console.log("employees", employees.value);
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
};
onMounted(fetchEmployees);

// Format date value before display
const formatDate = (date) => {
  return date ? new Date(date).toISOString().split("T")[0] : "";
};
const filteredEmployees = computed(() => {
  return employees.value.filter((employee) =>
    Object.values(employee).some((val) =>
      String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  );
});

//Prefill form data for edit employee
const editEmp = (employee) => {
  isEdit.value = true;
  formData.value = { ...employee };
  bootstrapModal.value.show();
};

//Update employee and reset form
const updateEmp = async () => {
  try {
    await axios.put(
      `http://localhost:5000/employees/${formData.value.empNo}`,
      formData.value
    );
    alert("Employee updated successfully");
    fetchEmployees();

    bootstrapModal.value.hide();
    resetForm();
  } catch (error) {
    console.log(error);
  }
};

// Delete data using employee id
const deleteData = async (empId) => {
  if (empId) {
    try {
      await axios.delete(`http://localhost:5000/employees/${empId}`);
      alert("employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  }
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f4f4f4;
}
</style>
