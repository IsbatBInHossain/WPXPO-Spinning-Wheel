document.addEventListener('DOMContentLoaded', function () {
  const wheel = document.getElementById('wheel')
  const spinBtn = document.getElementById('spin-btn')
  const closeBtn = document.getElementById('close')
  const addBtn = document.getElementById('add-btn')
  const textBox = document.getElementById('input-box')
  const showResult = document.getElementById('result')

  const initialNames = ['Ibrahim', 'Jasim', 'Jisan', 'Rifat', 'Teebro']
  const initialColors = ['#4bc421', '#2d96ff', '#c12eee', '#ff9400', '#f22828']
  const options = {
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
  let infoArray = initialNames.map((name, index) => {
    return {
      name,
      minValue: index * 72,
      maxValue: (index + 1) * 72,
      color: initialColors[index],
    }
  })
  const pi = Math.PI

  // function to create colors
  function getRandomColor() {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  // function to get the normalized angle value

  function normAngel(angle) {
    return angle - pi * 2 * Math.floor(angle / (2 * pi))
  }
  function normAngelDeg(angle) {
    return angle - 360 * Math.floor(angle / 360)
  }

  closeBtn.addEventListener('click', e => {
    showResult.style.display = 'none'
    closeBtn.style.display = 'none'
  })

  addBtn.addEventListener('click', e => {
    // get name from textarea to form names array
    const values = textBox.value
    const names = values.split('\n')

    // reset textarea
    textBox.value = ''

    // create data_array of equal size data
    const dataArray = Array(names.length).fill(1)
    const colorsArray = names.map(i => getRandomColor())
    const pieAngle = 360 / dataArray.length
    let tempValue = -0.001

    // create the info array with angle data and other
    infoArray = names.map((name, index) => {
      const minValue = parseFloat((tempValue + 0.001).toFixed(3)) // Convert to number
      const maxValue = parseFloat(((index + 1) * pieAngle).toFixed(3)) // Convert to number
      tempValue = maxValue

      return {
        name,
        minValue,
        maxValue,
        color: colorsArray[index],
      }
    })
    console.log(infoArray)

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

    const oldChart = Chart.getChart('wheel')

    if (oldChart) oldChart.destroy()

    chart = new Chart(wheel, {
      type: 'pie',
      data: data,
      options: options,
    })
  })

  const resultFinder = angle => {
    const angleDeg = (angle * 180) / Math.PI

    for (let item of infoArray) {
      const flag = item.minValue > item.maxValue
      if (
        (angleDeg >= item.minValue && angleDeg <= item.maxValue && !flag) ||
        (angleDeg >= item.minValue && flag)
      ) {
        showResult.style.display = 'flex'
        closeBtn.style.display = 'flex'
        showResult.innerHTML = ` ${item.name} is Winner!`
        break // Once winner is found, exit the loop
      }
    }

    // Update values outside the loop
    infoArray.forEach(item => {
      item.minValue += parseFloat(angleDeg.toFixed(3))
      item.minValue = normAngelDeg(item.minValue)
      item.maxValue += parseFloat(angleDeg.toFixed(3))
      item.maxValue = normAngelDeg(item.maxValue)
    })
  }

  spinBtn.addEventListener('click', () => {
    spinBtn.disabled = true
    closeBtn.style.display = 'none'
    showResult.style.display = 'none'
    let radianAngle = Math.floor(Math.random() * 2 * pi)
    // if (radianAngle > 2 * pi) radianAngle = radianAngle - 2 * pi
    let currentRotation = normAngel(chart.options.rotation)
    let rotationCount = 0
    const maxCount = Math.floor(Math.random() * 5 + 15)
    let rotation = 64
    const rotationInterval = setInterval(() => {
      chart.options.rotation =
        chart.options.rotation + rotation / (rotationCount + 1)
      currentRotation++
      chart.update()
      if (currentRotation >= 2 * pi) {
        rotationCount++
        currentRotation = currentRotation - pi * 2
      }
      if (rotationCount >= maxCount && currentRotation >= radianAngle) {
        resultFinder(normAngel(chart.options.rotation))
        spinBtn.disabled = false
        clearInterval(rotationInterval)
      }
    }, 20)
  })
})
