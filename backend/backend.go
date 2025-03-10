package main

import (
	"backend/dbtools"
	"backend/enum"
	"backend/events"
	"backend/lifter"
	"backend/structs"
	"backend/utilities"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/heroku/x/hmetrics/onload"
)

var processedLeaderboard structs.LeaderboardData

// var lifterData = lifter.Build()

var QueryCache dbtools.QueryCache

func getTest(c *gin.Context) {
	hour, mins, sec := time.Now().Clock()
	retStruct := structs.TestPayload{Hour: hour, Min: mins, Sec: sec}
	c.JSON(http.StatusOK, retStruct)
}

func getSearchName(c *gin.Context) {
	const maxResults = 50
	if len(c.Query("name")) >= 3 {
		search := structs.NameSearch{NameStr: c.Query("name")}
		results := structs.NameSearchResults{Names: lifter.NameSearch(search.NameStr, &processedLeaderboard.AllTotals)}
		// todo: remove this and implement a proper solution
		if len(results.Names) > maxResults {
			results.Names = results.Names[:maxResults]
		}
		c.JSON(http.StatusOK, results)
	}
}

func postEventResult(c *gin.Context) {
	eventSearch := structs.NameSearch{}
	if err := c.BindJSON(&eventSearch); err != nil {
		_ = c.AbortWithError(http.StatusBadRequest, err)
	}
	eventData := events.FetchEvent(eventSearch.NameStr, &processedLeaderboard)
	if len(eventData) != 0 {
		c.JSON(http.StatusOK, eventData)
	} else {
		c.JSON(http.StatusNoContent, nil)
	}
}

func postLifterRecord(c *gin.Context) {
	lifterSearch := structs.NameSearch{}
	if err := c.BindJSON(&lifterSearch); err != nil {
		_ = c.AbortWithError(http.StatusBadRequest, err)
	}

	lifterDetails := lifter.FetchLifts(lifterSearch, &processedLeaderboard)
	lifterDetails.Lifts = dbtools.SortDate(lifterDetails.Lifts)
	finalPayload := lifterDetails.GenerateChartData()
	if len(lifterDetails.Lifts) != 0 {
		c.JSON(http.StatusOK, finalPayload)
	} else if len(lifterDetails.Lifts) == 0 {
		c.JSON(http.StatusNoContent, nil)
	}
}

func postLifterHistory(c *gin.Context) {
	lifterSearch := structs.NameSearch{}
	if err := c.BindJSON(&lifterSearch); err != nil {
		_ = c.AbortWithError(http.StatusBadRequest, err)
	}

	lifterDetails := lifter.FetchLifts(lifterSearch, &processedLeaderboard)
	lifterDetails.Lifts = dbtools.SortDate(lifterDetails.Lifts)
	lifterDetails.Graph = lifterDetails.GenerateChartData()
	lifterDetails.Lifts = utilities.ReverseSlice(lifterDetails.Lifts)

	if len(lifterDetails.Lifts) != 0 {
		c.JSON(http.StatusOK, lifterDetails)
	} else if len(lifterDetails.Lifts) == 0 {
		c.JSON(http.StatusNoContent, nil)
	}
}

// Main leaderboard function
func postLeaderboard(c *gin.Context) {
	body := structs.LeaderboardPayload{}
	if err := c.BindJSON(&body); err != nil {
		abortErr := c.AbortWithError(http.StatusBadRequest, err)
		log.Println(abortErr)
		return
	}

	// todo: remove this once the frontend filters have been updated to suit
	switch body.Year {
	case 69:
		body.StartDate = enum.ZeroDate
		body.EndDate = enum.MaxDate
	default:
		body.StartDate = strconv.Itoa(body.Year) + "-01-01"
		body.EndDate = strconv.Itoa(body.Year+1) + "-01-01"
	}

	leaderboardData := processedLeaderboard.Select(body.SortBy) // Selects either total or sinclair sorted leaderboard
	fedData := dbtools.FilterLifts(*leaderboardData, body, dbtools.WeightClassList[body.WeightClass], &QueryCache)
	c.JSON(http.StatusOK, fedData)
}

func CORSConfig(localEnv bool) cors.Config {
	corsConfig := cors.DefaultConfig()
	if localEnv {
		log.Println("Local mode - Disabling CORS nonsense")
		corsConfig.AllowOrigins = []string{"https://www.openweightlifting.org", "http://localhost:3000"}
	} else {
		corsConfig.AllowOrigins = []string{"https://www.openweightlifting.org"}
	}
	corsConfig.AllowCredentials = true
	corsConfig.AddAllowHeaders("Access-Control-Allow-Headers", "access-control-allow-origin, access-control-allow-headers", "Content-Type", "X-XSRF-TOKEN", "Accept", "Origin", "X-Requested-With", "Authorization")
	corsConfig.AddAllowMethods("GET", "POST", "PUT", "DELETE")
	return corsConfig
}

func setupCORS(r *gin.Engine) {
	// It's not a great solution but it'll work
	if len(os.Args) > 1 && os.Args[1] == "local" {
		r.Use(cors.New(CORSConfig(true)))
	} else {
		r.Use(cors.New(CORSConfig(false)))
	}
}

func buildServer() *gin.Engine {
	log.Println("Starting server...")
	dbtools.BuildDatabase(&processedLeaderboard)
	r := gin.Default()
	setupCORS(r)
	r.GET("test", getTest)
	r.POST("leaderboard", postLeaderboard)
	r.GET("search", getSearchName)
	r.POST("lifter", postLifterRecord)
	r.POST("history", postLifterHistory)
	r.POST("event", postEventResult)
	return r
}

// CacheMeOutsideHowBoutDat - Precaches data on startup on a separate thread due to container timeout constraints.
func CacheMeOutsideHowBoutDat() {
	log.Println("Precaching data...")
	for n, query := range dbtools.PreCacheQuery {
		log.Println("Caching query: ", n)
		_, _ = QueryCache.CheckQuery(query)
		liftdata := processedLeaderboard.Select(query.SortBy)
		dbtools.PreCacheFilter(*liftdata, query, dbtools.WeightClassList[query.WeightClass], &QueryCache)
	}
	log.Println("Caching complete")
}

func main() {
	apiServer := buildServer()
	go CacheMeOutsideHowBoutDat()
	err := apiServer.Run()
	if err != nil {
		log.Fatal("Failed to run server")
	}
}
