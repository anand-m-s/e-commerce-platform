const codBtn = document.getElementById('cod');
const onlineBtn = document.getElementById('online');
const dailyBtn = document.getElementById('today');
const weeklyBtn = document.getElementById('week')
const monthlyBtn = document.getElementById('month');
const yearlyBtn = document.getElementById('year')
const dateForm = document.getElementById('dateForm')
window.jsPDF = window.jspdf.jsPDF;
let doc = new jsPDF();

const templateString = `
<table class="table table-striped" id="salesReport">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Order ID</th>
              <th scope="col">Buyer</th>
              <th scope="col">Product Name</th>
              <th scope="col">Category</th>
              <th scope="col">Quantity</th>
              <th scope="col">Total</th>
              <th scope="col">payment Method</th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
          <% salesReport.forEach(order => { %>
            <tr>
              <td><%= order.orderDate %></td>
              <td><%= order._id %></td>
              <td><%= order.userDetails.username %></td>
              <td><%= order.productDetails.Name %></td>
              <td><%= order.productDetailsCategory.categoryName %></td>
              <td><%= order.products.quantity %></td>
              <td><%= order.products.pricePerQnt %></td>
              <td><%= order.paymentMethod %></td>
            </tr>
          <% }); %>

          </tbody>

        </table>
`
let dataTable;

function findStartDate(days) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  return startDate
}

function generateTemplate(salesReport) {
    // Assuming `templateString` is your EJS template string
    const template = ejs.compile(templateString);
    const html = template({ salesReport: salesReport });
    document.querySelector('#salesReport').innerHTML = html;
  
    // Assuming `dataTable` is a DataTable instance
    dataTable.destroy();
    dataTable = new DataTable('#salesReport');
  }
  

$(document).ready(() => {
  dataTable = new DataTable('#salesReport');
});


codBtn.addEventListener('click', (e) => {
  fetch('/admin/salesreport/cod', { method: 'get' })
    .then((response) => {
      response.json()
        .then(response => generateTemplate(response))
    })
})

onlineBtn.addEventListener('click', (e) => {
  fetch('/admin/salesreport/Razorpay', { method: 'get' })
    .then((response) => {
      response.json()
        .then(response => generateTemplate(response))
    })
})

dailyBtn.addEventListener('click', (e) => {
  const startDate = new Date()
  fetch(`/admin/dated-sales-report?startDate=${startDate}&endDate=${new Date()}`, {
    method: 'get'
  })
    .then((response) => {
      response.json()
        .then(response => generateTemplate(response))
    })
})

weeklyBtn.addEventListener('click', () => {
  const startDate = findStartDate(7)
  fetch(`/admin/dated-sales-report?startDate=${startDate}&endDate=${new Date()}`, {
    method: 'get'
  })
    .then((response) => {
      response.json()
        .then(response => generateTemplate(response))
    })
})

monthlyBtn.addEventListener('click', () => {
  const startDate = findStartDate(30)
  fetch(`/admin/dated-sales-report?startDate=${startDate}&endDate=${new Date()}`, {
    method: 'get'
  })
    .then((response) => {
      response.json()
        .then(response => generateTemplate(response))
    })
})

yearlyBtn.addEventListener('click', () => {
  const startDate = findStartDate(365)
  fetch(`/admin/dated-sales-report?startDate=${startDate}&endDate=${new Date()}`, {
    method: 'get'
  })
    .then((response) => {
      response.json()
        .then(response => generateTemplate(response))
    })
})

dateForm.addEventListener('submit', (e) => {
  e.preventDefault()
  let startDate = dateForm.startDate.value
  let endDate = dateForm.endDate.value
  if (startDate == '' || endDate == '') {
    document.querySelector('#dateErr').innerHTML = 'Please select Date'
  } else {
    startDate = new Date(startDate)
    endDate = new Date(endDate)
    if (startDate >= endDate) {
      document.querySelector('#dateErr').innerHTML = 'Please check your selected Date'
    } else {
      fetch(`/admin/dated-sales-report?startDate=${startDate}&endDate=${new Date()}`, {
        method: 'get'
      })
        .then((response) => {
          response.json()
            .then(response => generateTemplate(response))
        })
    }

  }
})

document.getElementById('downloadPdf').addEventListener('click', function () {
  doc.text('SALES REPORT', 20, 20);
  doc.autoTable({ html: '#salesReport' ,margin: { top: 40 }});
  doc.save('sales_report.pdf');
});