package main

import (
	"backend/dbtools"
	"backend/enum"
	"backend/structs"
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"os"
)

var processedLeaderboard = buildDatabase()

//Main leaderboard function
func postLeaderboard(c *gin.Context) {
	body := structs.LeaderboardPayload{}
	if err := c.BindJSON(&body); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	//todo: add in query checker, so it doesn't shit the bed on a bad query
	if body.Federation != enum.ALLFEDS {
		fedData := dbtools.FilterFederation(processedLeaderboard.Query(body.SortBy, body.Gender), body.Federation, body.Start, body.Stop)
		c.JSON(http.StatusOK, fedData)

	} else {
		c.JSON(http.StatusOK, processedLeaderboard.Query(body.SortBy, body.Gender)[body.Start:body.Stop])
	}
}

func buildDatabase() (leaderboardTotal *structs.LeaderboardData) {
	log.Println("buildDatabase called...")
	bigData := dbtools.CollateAll()
	male, female, _ := dbtools.SortGender(bigData) // Throwaway the unknown genders as they're likely really young kids
	leaderboardTotal = &structs.LeaderboardData{
		MaleTotals:      dbtools.TopPerformance(male, enum.Total),
		FemaleTotals:    dbtools.TopPerformance(female, enum.Total),
		MaleSinclairs:   dbtools.TopPerformance(male, enum.Sinclair),
		FemaleSinclairs: dbtools.TopPerformance(female, enum.Sinclair),
	}
	return leaderboardTotal
}

func CORSConfig() cors.Config {
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"https://www.openweightlifting.org"}
	corsConfig.AllowCredentials = true
	corsConfig.AddAllowHeaders("Access-Control-Allow-Headers", "access-control-allow-origin, access-control-allow-headers", "Content-Type", "X-XSRF-TOKEN", "Accept", "Origin", "X-Requested-With", "Authorization")
	corsConfig.AddAllowMethods("GET", "POST", "PUT", "DELETE")
	return corsConfig
}

func main() {
	r := gin.Default()
	//It's not a great solution but it'll work
	if len(os.Args) > 1 && os.Args[1] == "local" {
		fmt.Println("Local mode - Disabling CORS nonsense")
	} else {
		r.Use(cors.New(CORSConfig()))
	}
	r.POST("leaderboard", postLeaderboard)
	err := r.Run()
	if err != nil {
		log.Fatal("Failed to run server")
	}
}
