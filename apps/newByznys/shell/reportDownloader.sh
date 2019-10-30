#! /bin/bash
## ^^ na ubuntu je treba pustit jako bash ne dash 

# Api pro vyjeti operation report   
# API SAS
# https://cent.aimatch.com/api_docs

echo -e "\n"
echo -e "==================================================================="
echo -e "\n"



# api key - uloz do souboru key 
apiKey=$(cat key)
#echo $myKey

#barvicky
RED='\033[0;31m'
NC='\033[0m' # No Color

#posli errory dopryc, xpath xmllint neco hazi ale funguje to
exec 2>/dev/null

# smaz stary
rm response.xml
rm response.csv




# postavime url reportu

reportUrl="https://cent.aimatch.com/reports/performance_report.xml"

# area size a site je podle id v sasu, napr. area 'zpravy' je 51
# https://cent.aimatch.com/areas/51-zpravy/edit

reportOptions="&utf8=%E2%9C%93&tactical_report%5Btitle%5D=&tactical_report%5Bdate_range%5D=Date+Range&tactical_report%5Bdate_gte%5D=10%2F29%2F2018&tactical_report%5Bdate_lte%5D=10%2F29%2F2019&tactical_report%5Bshow_viewability%5D=0&tactical_report%5Bagency_id%5D=&tactical_report%5Badvertiser_id%5D=&tactical_report%5Bshow_custom_actions%5D=0&tactical_report%5Bcampaigns%5D%5B%5D=&tactical_report%5Bflights%5D%5B%5D=&tactical_report%5Bcreatives%5D%5B%5D=&tactical_report%5Btiers%5D%5B%5D=&tactical_report%5Bproducts%5D%5B%5D=&tactical_report%5Bflight_type%5D=&tactical_report%5Bsalesperson_id%5D=&tactical_report%5Btrafficker_id%5D=&tactical_report%5Bsites%5D%5B%5D=&tactical_report%5Bareas%5D%5B%5D=&tactical_report%5Bsizes%5D%5B%5D=&tactical_report%5Bemails%5D=&tactical_report%5Bhour_of_day_daily%5D=00&tactical_report%5Bminute_of_hour_daily%5D=00&tactical_report%5Bday_of_week%5D=0&tactical_report%5Bhour_of_day_weekly%5D=00&tactical_report%5Bday_of_month%5D=1&tactical_report%5Bhour_of_day_monthly%5D=00&tactical_report%5Bexpiration_in_words%5D="


# reportOptions query url:, datum je gte a lte 
# date_range%5D=Date+Range&tactical_report%5Bdate_gte%5D=10%2F29%2F2018&tactical_report%5Bdate_lte%5D=10%2F29%2F2019# 

# &utf8=%E2%9C%93&tactical_report%5Btitle%5D=&tactical_report%5Bdate_range%5D=Date+Range&tactical_report%5Bdate_gte%5D=10%2F29%2F2018&tactical_report%5Bdate_lte%5D=10%2F29%2F2019&tactical_report%5Bshow_viewability%5D=0&tactical_report%5Bagency_id%5D=&tactical_report%5Badvertiser_id%5D=&tactical_report%5Bshow_custom_actions%5D=0&tactical_report%5Bcampaigns%5D%5B%5D=&tactical_report%5Bflights%5D%5B%5D=&tactical_report%5Bcreatives%5D%5B%5D=&tactical_report%5Btiers%5D%5B%5D=&tactical_report%5Bproducts%5D%5B%5D=&tactical_report%5Bflight_type%5D=&tactical_report%5Bsalesperson_id%5D=&tactical_report%5Btrafficker_id%5D=&tactical_report%5Bsites%5D%5B%5D=&tactical_report%5Bareas%5D%5B%5D=&tactical_report%5Bsizes%5D%5B%5D=&tactical_report%5Bemails%5D=&tactical_report%5Bhour_of_day_daily%5D=00&tactical_report%5Bminute_of_hour_daily%5D=00&tactical_report%5Bday_of_week%5D=0&tactical_report%5Bhour_of_day_weekly%5D=00&tactical_report%5Bday_of_month%5D=1&tactical_report%5Bhour_of_day_monthly%5D=00&tactical_report%5Bexpiration_in_words%5D=


requestUrl=$reportUrl
requestUrl+="?api_key=${apiKey}"
requestUrl+=$reportOptions
requestUrl+="&commit_export_csv=Export+csv"

printf "${RED}requestUrl:${NC}\n"
echo "$requestUrl"


# zavolame si do sasu pro report, ten vrati xml pro Backgroundtask, napr.:  
# <BackgroundTask>
#   <JobId>407bc3abe698657a41a70097d9fd9e40</JobId>
#   <ProgressbarEnabled type="boolean">false</ProgressbarEnabled>
#   <Email>filip.cizkovsky@economia.cz</Email>
# </BackgroundTask>

echo -e "\n"
curl -H "Accept: application/xml" -H "Content-Type: application/xml" -X GET "${requestUrl}" > response.xml

echo -e "\n"
printf "${RED}response.xml${NC}\n"
cat response.xml
echo -e "\n"

#vytahni z xml odpovedi JobId
jobId=$(xmllint --xpath "string(//JobId)" response.xml) 
printf "${RED}JobId:${NC}\n"
echo -e "$jobId"


# a pak si reknem v nejakych intervalech o odpoved
# viz https://cent.aimatch.com/api_docs/run_reports

retrieveUrl=$requestUrl
retrieveUrl+="&job_id=$jobId"

echo -e "\n"
# printf "${RED}retrieveUrl${NC}\n"
# echo -e "$retrieveUrl"
# echo -e "\n"

echo -e "Zkousim ziskat odpoved s csv kazdych 10 vterin"
echo -e "\n"

counter=1

while [[ counter -le 100 ]]; do
	sleep 10
	echo "Pokus cislo: $counter"
	echo -e "\n"


	curl -H "Accept: application/xml" -H "Content-Type: application/xml" -X GET "${retrieveUrl}" > response.csv

	# vratil se error?
	error=$(xmllint --xpath "string(//error)" response.csv) 

	if grep "error" response.csv > /dev/null ; then 
	    echo "$error"
		echo -e "\n"
	else
		break	    
	fi

	(( counter++ ))

done



echo -e "\n"
# printf "${RED}response.csv${NC}\n"

# tabulka pres awk
# awk -F '","' '{ printf "%-10s %-10s %-10s %-10s %-10s\n", $1, $2, $3, $4, $5 }' response.csv

#cat response.csv

echo -e "\n\n"









