// Waiting for the DOM to be fully loaded before executing the code
document.addEventListener('DOMContentLoaded', function () {
  // Getting necessary elements from the document
  const wheel = document.getElementById('wheel')
  const spinBtn = document.getElementById('spin-btn')
  const closeBtn = document.getElementById('close')
  const addBtn = document.getElementById('add-btn')
  const textBox = document.getElementById('input-box')
  const showResult = document.getElementById('result')

  // Initial data for the wheel
  const initialNames = ['Ibrahim', 'Jasim', 'Jisan', 'Rifat', 'Teebro']
  const initialColors = ['#4bc421', '#2d96ff', '#c12eee', '#ff9400', '#f22828']
  const options = {
    // Options for the chart
    responsive: true,
    cutout: 20,
    animation: false,
    plugins: {
      labels: {
        render: 'label',
        fontColor: '#fff',
        fontSize: 24,
      },
      legend: {
        display: false,
      },
      tooltip: false,
    },
    datalabels: {
      color: '#ffffff',
      formatter: (_, context) => context.chart.data.labels[context.dataIndex],
      font: { size: 24 },
    },
  }

  // Creating the initial chart
  let chart = new Chart(wheel, {
    type: 'pie',
    data: {
      labels: initialNames,
      datasets: [
        {
          label: 'Wheel',
          data: [1, 1, 1, 1, 1],
          backgroundColor: initialColors,
        },
      ],
    },
    options: options,
  })

  // Creating an array of objects to store angle data and other information
  let infoArray = initialNames.map((name, index) => {
    return {
      name,
      minValue: index * 72,
      maxValue: (index + 1) * 72,
      color: initialColors[index],
    }
  })

  // Function to generate random colors
  function getRandomColor() {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  // Function to normalize the angle value
  function normAngelDeg(angle) {
    return angle - 360 * Math.floor(angle / 360)
  }

  // Event listener for the close button
  closeBtn.addEventListener('click', e => {
    showResult.style.display = 'none'
    closeBtn.style.display = 'none'
  })

  // Event listener for the add button
  addBtn.addEventListener('click', e => {
    // Getting names from the text area and resetting the text area
    const values = textBox.value
    const names = values.split('\n')
    textBox.value = ''

    // Creating data arrays and colors for the chart
    const dataArray = Array(names.length).fill(1)
    const colorsArray = names.map(i => getRandomColor())
    const pieAngle = 360 / dataArray.length
    let tempValue = -0.001

    // Creating the info array with angle data and other information
    infoArray = names.map((name, index) => {
      const minValue = parseFloat((tempValue + 0.001).toFixed(3))
      const maxValue = parseFloat(((index + 1) * pieAngle).toFixed(3))
      tempValue = maxValue

      return {
        name,
        minValue,
        maxValue,
        color: colorsArray[index],
      }
    })

    const data = {
      labels: names,
      datasets: [
        {
          label: 'Wheel',
          data: dataArray,
          backgroundColor: colorsArray,
        },
      ],
    }

    // Destroying the old chart and creating a new one with the updated data
    const oldChart = Chart.getChart('wheel')
    if (oldChart) oldChart.destroy()

    chart = new Chart(wheel, {
      type: 'pie',
      data: data,
      options: options,
    })
  })

  // Function to find the winner based on the generated angle
  const resultFinder = angle => {
    for (let item of infoArray) {
      const flag = item.minValue > item.maxValue
      if (
        (angle >= item.minValue && angle <= item.maxValue && !flag) ||
        (angle >= item.minValue && flag)
      ) {
        showResult.style.display = 'flex'
        closeBtn.style.display = 'flex'
        showResult.innerHTML = ` ${item.name} is Winner!`
        break
      }
    }

    // Updating the values of the infoArray based on the generated angle
    infoArray.forEach(item => {
      item.minValue += parseFloat(angle.toFixed(3))
      item.minValue = normAngelDeg(item.minValue)
      item.maxValue += parseFloat(angle.toFixed(3))
      item.maxValue = normAngelDeg(item.maxValue)
    })
  }

  // Event listener for the spin button
  spinBtn.addEventListener('click', () => {
    // Disabling the spin button and hiding the close button and result display
    spinBtn.disabled = true
    closeBtn.style.display = 'none'
    showResult.style.display = 'none'

    // Generating a random angle for the spin
    let angle = Math.floor(Math.random() * 360)

    // Getting the current rotation of the wheel
    let currentRotation = normAngelDeg(chart.options.rotation)

    // Initializing the rotation count and maximum count for the spin
    let rotationCount = 0
    const maxCount = Math.floor(Math.random() * 5 + 5)

    // Setting the rotation value for each step of the spin
    let rotation = 64

    // Setting up the rotation interval for the spin animation
    const rotationInterval = setInterval(() => {
      chart.options.rotation =
        chart.options.rotation + rotation / (rotationCount + 1)
      currentRotation += rotation / (rotationCount + 1)
      chart.update()

      // Checking if the rotation has completed a full circle
      if (chart.options.rotation >= 360) {
        rotationCount++
        currentRotation = currentRotation - 360
        chart.options.rotation = chart.options.rotation - 360
      }

      // Checking if the maximum count has been reached and if the current rotation exceeds the generated angle
      if (rotationCount >= maxCount && currentRotation >= angle) {
        // Calling the resultFinder function to determine the winner
        resultFinder(normAngelDeg(angle + 90))

        // Enabling the spin button and clearing the rotation interval
        spinBtn.disabled = false
        clearInterval(rotationInterval)
      }
    }, 20)
  })
})
