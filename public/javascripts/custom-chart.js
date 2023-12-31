//custom-chart.js
(function ($) {
    "use strict";
    let monthlySalesArray = document.getElementById("monthlySalesArray").value;
  
    monthlySalesArray = monthlySalesArray.trim(); // Remove leading and trailing whitespace
    monthlySalesArray = monthlySalesArray.split(",");
    monthlySalesArray = monthlySalesArray.map((item) => Number(item));
    monthlySalesArray = Array(monthlySalesArray);
    monthlySalesArray = monthlySalesArray[0];
    console.log(monthlySalesArray);
  
    let productsPerMonth = document.getElementById("productsPerMonth").value;
  
    productsPerMonth = productsPerMonth.trim(); // Remove leading and trailing whitespace
    productsPerMonth = productsPerMonth.split(",");
    productsPerMonth = productsPerMonth.map((item) => Number(item));
    productsPerMonth = Array(productsPerMonth);
    productsPerMonth = productsPerMonth[0];

    let yearlySalesArray = document.getElementById("yearlySalesArray").value;

    yearlySalesArray = yearlySalesArray.trim(); // Remove leading and trailing whitespace
    yearlySalesArray = yearlySalesArray.split(",");
    yearlySalesArray = yearlySalesArray.map((item) => Number(item));
    yearlySalesArray = Array(yearlySalesArray);
    yearlySalesArray = yearlySalesArray[0];
    console.log(yearlySalesArray);

    /Sale statistics Chart/
    if ($("#myChart").length) {
      var ctx = document.getElementById("myChart").getContext("2d");
      var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: "line",
  
        // The data for our dataset
        data: {
          labels: [
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
          datasets: [
            {
              label: "Sales",
              tension: 0.3,
              fill: true,
              backgroundColor: "rgba(44, 120, 220, 0.2)",
              borderColor: "rgba(44, 120, 220)",
              data: monthlySalesArray,
            },
            {
              label: "Products",
              tension: 0.3,
              fill: true,
              backgroundColor: "rgba(4, 209, 130, 0.2)",
              borderColor: "rgb(4, 209, 130)",
              data: productsPerMonth,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              labels: {
                usePointStyle: true,
              },
            },
          },
        },
      });
    } //End
  // Yearly sales Chart
if ($("#myChart3").length) {
  var ctx3 = document.getElementById("myChart3").getContext("2d");
  var chart3 = new Chart(ctx3, {
    type: "bar",
    data: {
      labels: [2023, 2024, 2025, 2026, 2027],
      datasets: [
        {
          label: "Yearly Sales",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          data: yearlySalesArray,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
      animation: {
        onComplete: () => {
          console.log("Animation complete");
        },
        delay: (context) => {
          return context.dataIndex * 100; // Adjust the delay as needed
        },
        easing: "easeInOutQuart", // Use a different easing function if desired
        duration: 1000, // Animation duration in milliseconds
      },
    },
  });
}

    
  })(jQuery);
  
  /Sale statistics Chart/
  // let orderStatusArray = document.getElementById("orderStatusArray").value;
  
  // orderStatusArray = orderStatusArray.trim(); // Remove leading and trailing whitespace
  // orderStatusArray = orderStatusArray.split(",");
  // orderStatusArray = orderStatusArray.map((item) => Number(item));
  // orderStatusArray = Array(orderStatusArray);
  // orderStatusArray = orderStatusArray[0];
  // console.log(orderStatusArray);
  
  // // Sample data for the polar area chart
  // const polarData = {
  //   labels: ["Delivered", "Pending", "Cancel order", "Out of Delivery"],
  //   datasets: [
  //     {
  //       data: orderStatusArray,
  //       backgroundColor: [
  //         "rgba(255, 99, 132, 0.5)",
  //         "rgba(54, 162, 235, 0.5)",
  //         "rgba(255, 206, 86, 0.5)",
  //         "rgba(75, 192, 192, 0.5)",
  //       ],
  //       borderColor: [
  //         "rgba(255, 99, 132, 1)",
  //         "rgba(54, 162, 235, 1)",
  //         "rgba(255, 206, 86, 1)",
  //         "rgba(75, 192, 192, 1)",
  //       ],
  //       borderWidth: 1,
  //     },
  //   ],
  // };
  
  // // Configuration options for the polar area chart
  // const polarOptions = {
  //   scale: {
  //     ticks: {
  //       beginAtZero: true,
  //     },
  //   },
  // };
  
  // // Get the canvas element for the polar area chart
  // const ctx2 = document.getElementById("myChart2").getContext("2d");
  
  // // Create the polar area chart
  // const myChart2 = new Chart(ctx2, {
  //   type: "polarArea",
  //   data: polarData,
  //   options: polarOptions,
  // });


  let orderStatusArray = document.getElementById("orderStatusArray").value;

orderStatusArray = orderStatusArray.trim(); // Remove leading and trailing whitespace
orderStatusArray = orderStatusArray.split(",");
orderStatusArray = orderStatusArray.map((item) => Number(item));
orderStatusArray = Array(orderStatusArray);
orderStatusArray = orderStatusArray[0];

// Sample data for the doughnut chart
const doughnutData = {
  labels: ["Delivered", "Pending", "Cancel order", "Out of Delivery"],
  datasets: [
    {
      label: "Dataset 1",
      data: orderStatusArray,     
    },
  ],
};

// Configuration options for the doughnut chart
const doughnutOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Order Status",
    },
  },
};

// Get the canvas element for the doughnut chart
const ctx = document.getElementById("myChart2").getContext("2d");

// Create the doughnut chart
const myChart2 = new Chart(ctx, {
  type: "doughnut",
  data: doughnutData,
  options: doughnutOptions,
});


  