/**
 * Controller responsible for all events in view and setting data
 *
 * @author Pim Meijer
 */
let statsChart;
let momentArray = [];
let weekData = [0,0,0,0,0,0,0];
let pamDates;

class StatisticsController extends CategoryController {
    constructor() {
        super();
        this.loadView("views/statistics.html");
        this.pamRepository = new PamRepository();
        this.userRepository = new UserRepository();
    }

    //Called when the login.html has been loaded.
    setup(data) {

        //Set the navigation color to the correct CSS variable.
        this.updateCurrentCategoryColor("--color-category-statistics");
        //Set the navigation to the correct state.
        nav.setNavigationState(navState.User)

        //Load the login-content into memory.
        this.view = $(data);

        // this.pamRepository.getPam(sessionManager.get(""))
        //Empty the content-div and add the resulting view to the page.
        $(".content").empty().append(this.view);

        // Set the normal datepicker date
        $(".datepicker-stats--normal").val(moment().format("YYYY-MM-DD"));

        this.getPamDates().then((e) => {
            pamDates = e;
            pamDates.forEach((date, index) => {
                return pamDates[index].date = moment(date.date);
            })
            this.loadSimpleStats(pamDates);
        });

        //When clicked the advance stats button, show stats
        $(document).on("click", ".advanced-stats", () => this.changeScreen(true));
        $(document).on("click", ".normal-stats", () => this.changeScreen(false));

        // When the datepicker changes value

        $(document).on("change", ".datepicker-stats", () => this.updateChart());
        $(document).on("change", ".datepicker-stats--normal", () => this.updateStats());

        // The left and right for normal stats
        $(document).on("click", ".arrow-normal-date__left", (e) => {
            // Stops firing the event twice
            e.stopImmediatePropagation();

            this.changeDayArrows("left");
        });

        $(document).on("click", ".arrow-normal-date__right", (e) => {
            // Stops firing the event twice
            e.stopImmediatePropagation();

            this.changeDayArrows("right")
        });

        // The left and right arrow on click for advanced stats
        $(document).on("click", ".arrow-advanced-date__left", (e) => {
            // Stops firing the event twice
            e.stopImmediatePropagation();

            this.changeWeekArrows("left");
        });

        $(document).on("click", ".arrow-advanced-date__right", (e) => {
            // Stops firing the event twice
            e.stopImmediatePropagation();

            this.changeWeekArrows("right");
        });
    }

    /**
     * Change the screens from basic stats to advanced chart
     * @boolean advanced do you want to go to the advanced chart or not
     */
    changeScreen(advanced) {
        if (advanced === true) {
            $(".content").load("views/advanced_statistics.html", () => {
                this.makeStats().then(() => {

                });
                if ($(".datepicker-stats").val() === "") {
                    $(".datepicker-stats").val(moment().format("YYYY-MM-DD"));
                }
            });
        } else {
            $(".content").load("views/statistics.html", () => {
                if ($(".datepicker-stats--normal").val() === "") {
                    $(".datepicker-stats--normal").val(moment().format("YYYY-MM-DD"));
                }
                this.updateStats();
            });
        }
    }

    /**
     * Get pam dates
     * @returns {Promise<void>}
     */
    async getPamDates() {
        return await this.userRepository.getAll(sessionManager.get("userID"));
    }

    /**
     * Load the simple stats beginning with today
     * @param dates
     * @returns {Promise<void>}
     */
    async loadSimpleStats(dates) {
        let today = moment();

        for (let i = 0; i < dates.length; i++) {
            if (today.isSame(dates[i].date, 'date')) {
                this.applySimpleStats(dates[i], dates[i - 1]);
            }
        }

        if (dates.length < 1) {
            this.applySimpleStats(null, null);
        }

        if ($(".compare-calorie .card-text").val() === "") {
            this.applySimpleStats(null, null);
        }
    }

    /**
     * Set the simple stats
     * @param date, the date for the stats
     * @param yesterday the date to compare with
     */
    applySimpleStats(date, yesterday) {
        // Calorie section
        if (date != null) {
            $(".compare-calorie .card-text").text(`Je hebt ongeveer ${date.pam_score * 25} kilocalorieën verbrand!`)

            // Animal
            if (date.pam_score < 0) {
                $(".compare-animal .card-text").text('Je loopt evenveel als een schildpad!')
            } else if (date.pam_score > 0 && date.pam_score < 1 || date.pam_score === 1) {
                $(".compare-animal .card-text").text('Je hebt een slakkentempo, maar je loopt wel!')
            } else if (date.pam_score > 1 && date.pam_score < 2 || date.pam_score === 2) {
                $(".compare-animal .card-text").text('Nog niet vogelsvlug, maar wel onderweg!')
            } else if (date.pam_score > 2 && date.pam_score < 3 || date.pam_score === 3) {
                $(".compare-animal .card-text").text('Jeetje, je doet het even goed als een buizerd!')
            } else if (date.pam_score > 3 && date.pam_score < 4 || date.pam_score === 4) {
                $(".compare-animal .card-text").text('Dit is wel bijna een tijgertempo!')
            } else if (date.pam_score > 4 && date.pam_score < 5 || date.pam_score === 5) {
                $(".compare-animal .card-text").text('Jij bent stiekem gewoon een leeuw of niet?')
            } else if (date.pam_score > 5) {
                $(".compare-animal .card-text").text('Jij gaat zo goed, je hoeft deze hipper niet eens te dragen!')
            }

            // Yesterday section
            if (yesterday === null) {
                $(".compare-yesterday .card-text").text(`Je doet het beter dan gister! (Omdat je gister geen score had)`)
            } else {
                if (yesterday.pam_score > date.pam_score) {
                    $(".compare-yesterday .card-text").text(`Gister had je wat meer pam punten, kom op he! Het verschil is ${yesterday.pam_score - date.pam_score}`);
                } else {
                    $(".compare-yesterday .card-text").text(`Je doet het al beter dan gister! Lekker hoor! Je hebt ${date.pam_score - yesterday.pam_score} punten in verschil`);
                }
            }
        } else {
            $(".compare-calorie .card-text").text("Je hebt geen score voor vandaag")
            $(".compare-animal .card-text").text("Je hebt geen score voor vandaag")
            $(".compare-yesterday .card-text").text("Je hebt geen score voor vandaag")
        }
    }

    /**
     * Uses the arrows on statistic to change the week
     */
    changeWeekArrows(direction) {
        // If the direction is left, go back one week, otherwise go up one week
        if (direction === "left") {
            let firstVal = moment($(".datepicker-stats").val());
            firstVal = firstVal.subtract("1", "weeks");
            $(".datepicker-stats").val(firstVal.format("YYYY-MM-DD"));
            this.updateChart();
        } else {
            let firstVal = moment($(".datepicker-stats").val());
            firstVal = firstVal.add("1", "weeks");
            $(".datepicker-stats").val(firstVal.format("YYYY-MM-DD"));
            this.updateChart();
        }
    }

    /**
     * Uses the arrows to change the day
     * @param direction left or right
     */
    changeDayArrows(direction) {
        if (direction === "left") {
            let firstVal = moment($(".datepicker-stats--normal").val());
            firstVal = firstVal.subtract("1", "days");
            $(".datepicker-stats--normal").val(firstVal.format("YYYY-MM-DD"));
            this.updateStats();
        } else {
            let firstVal = moment($(".datepicker-stats--normal").val());
            firstVal = firstVal.add("1", "days");
            $(".datepicker-stats--normal").val(firstVal.format("YYYY-MM-DD"));
            this.updateStats();
        }
    }

    /**
     * Update the simple stats
     */
    updateStats() {
        let chosenDate = moment($(".datepicker-stats--normal").val());

        let sorted = pamDates.sort((a,b) => {
            return a.date.format('YYYYMMDD') - b.date.format('YYYYMMDD');
        })
        for (let i = 0; i < sorted.length; i++) {
            if (chosenDate.isSame(sorted[i].date, 'date')) {
                let yesterday = chosenDate.subtract('1', 'days');
                if (yesterday.isSame(sorted[i - 1].date, 'date')) {
                    this.applySimpleStats(sorted[i], sorted[i - 1]);
                    return true;
                } else {
                    this.applySimpleStats(sorted[i], null);
                    return true;
                }
            } else {
                this.applySimpleStats(null, null);
            }
        }
    }

    /**
     * Update the stats chart
     */
    updateChart() {
        let chosenWeek = moment($(".datepicker-stats").val());

        // Update the weekdata back to all 0, because if there isn't any numbers to replace it with, the array is also updated.
        weekData = [0,0,0,0,0,0,0];

        //Check for each moment if theyre in the same week and year, and then replace them
        momentArray.forEach((moment) => {
            // So if theyre in the same week and same year, use them
            if (moment.date.isoWeek() === chosenWeek.isoWeek() && moment.date.format('YYYY') === chosenWeek.format('YYYY')) {
                let dateIso = moment.date.isoWeekday();
                weekData[dateIso - 1] = moment.pam_score;
            }
        })

        // Set the weekdata and update the chart
        statsChart.data.datasets[0].data = weekData;
        statsChart.update();
    }
    
    /**
     * Make the stats chart
     * @returns {Promise<void>}
     */
    async makeStats() {
        // Destroy the chart first if exists NOT DONE RICK
        if (statsChart) {
            statsChart.destroy();
        }

        // Convert dates into moment objects
        momentArray = pamDates.map((number) => {
            number.date = moment(number.date);
            return number;
        });

        // Then sort the moment array into the right dates
        momentArray = momentArray.sort((a,b) => {
            return a.date.format('YYYYMMDD') - b.date.format('YYYYMMDD');
        })

        // Create an array with dates because the javascript get day method only gives you back a number.
        let days = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
        let pamScores = [];

        // Where the date date is
        let start = 0;

        for (let i = 0; i < momentArray.length; i++) {
            pamScores.push(momentArray[i]["pam_score"]);
            momentArray[i]["week"] = momentArray[i]["date"].isoWeek();

            // Set the dates
            let today = moment();

            if (today.isSame(momentArray[i]["date"], 'day')) {
                start = i;
            }
        }

        let startOfWeek;
        if (momentArray.length > 0) {
            let weekday = momentArray[start]["date"].isoWeekday();
            startOfWeek = moment().subtract((weekday - 1), "days").isoWeek();
        }

        // Check if they are from this week, and if they are, replace them in the
        momentArray.forEach((date) => {
            if (date.week === startOfWeek) {
                let dateIso = date.date.isoWeekday();
                weekData[dateIso - 1] = date.pam_score;
            }
        })
        // Create the context
        let ctx = document.getElementById('stats-chart').getContext('2d');

        //Set the context height, fixed height (might change later)
        ctx.height = 500;

        // Make the graph
        statsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Pamsore',
                    data: weekData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(0,191,243)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 0,191,243)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                maintainAspectRatio: false,
            }
        });
    }

    async getPamData(id) {
        this.retrievePam(id).then((event) => {
            return event;
        });
    }
}


