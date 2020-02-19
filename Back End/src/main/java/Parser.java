import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;

import java.io.*;
import java.util.*;

public class Parser {

    public static void SolrJSearcher(File queryFile, File stopWordsFile, int corpusSize) throws IOException, SolrServerException {
        SolrClient client = new HttpSolrClient.Builder("http://localhost:8983/solr/reddit").build();

        try (BufferedReader queryReader = new BufferedReader(new FileReader(queryFile))) {
            PrintWriter printWriter = new PrintWriter(new FileWriter("results.txt")); // printer to write result file

            // read through the queries file
            for (String queryLine = queryReader.readLine(); queryLine != null; queryLine = queryReader.readLine()) {

                // QUERY PORTION
                // print this query to the file
                printWriter.println(queryLine);
                System.out.println(queryLine);

                // get the tokens in the query
                String[] queryTerm = queryLine.replaceAll("[^a-zA-Z ]", "").toLowerCase().split("\\s+");

//                // score each term
//                Map<String, Integer> queryTermFrequency = new HashMap<>();
//                Map<String, Double> queryTermScore = new HashMap<>();
//
//                // getting the query frequency
//                for (String token : queryTerm) {
//                    if (stopWords.contains(token)) {
//                        continue;
//                    } else {
//                        if (token.equals("")) {
//                            continue;
//                        }
//                        if (queryTermFrequency.containsKey(token)) {
//                            queryTermFrequency.replace(token, queryTermFrequency.get(token) + 1);
//                        } else {
//                            queryTermFrequency.put(token, 1);
//                        }
//                        System.out.println("token added: " + token);
//                    }
//                }
//
//                // getting the query weights
//                for (Map.Entry<String, Integer> entry : queryTermFrequency.entrySet()) {
//                    String theKey = entry.getKey(); // query term
//                    int theValue = entry.getValue(); // term frequency
//                    System.out.println("current key: " + theKey);
//                    if (theKey.equals(" ")) continue; // skip any white space
//
//                    // calculating the weight for each term
//                    if (theValue == 0) {
//                        int tfWeight = 0;
//                        double idf = Math.log((float) corpusSize/queryTermFrequency.get(theKey));
//                        double weight = tfWeight * idf;
//                        queryTermScore.put(theKey, weight);
//                    } else {
//                        int tfWeight = queryTermFrequency.get(theKey);
//                        double idf = Math.log((float) corpusSize/queryTermFrequency.get(theKey));
//                        double weight = tfWeight * idf;
//                        queryTermScore.put(theKey, weight);
//                    }
//                }
//
//                // get the maps sorted by value descending so we can just look for the top terms
//                entriesSortedByValues(queryTermScore);
//
//                // iterate through the list and pick the top 3
//                List<String> termList = new ArrayList<>();
//                for (Map.Entry<String, Integer> entry : queryTermFrequency.entrySet()) {
//                    termList.add(entry.getKey());
//                    System.out.println(entry.getKey()); // term selected to query on
//                    if (termList.size() == 3) break;
//                }
//
//                // map that will hold our comparative results
//                Map<String, Integer> resultsMap = new HashMap<>();
//
//                for (int i = 0; i < 3; i++) {
//                    // now search for the top 3 terms in Solr
//                    SolrQuery query = new SolrQuery();
//
//                    if (termList.size() == 0) break;
//
//                    if (i + 1 == 3) {
//                        query.setQuery("TEXT:" + termList.get(i) + " AND " + "TEXT:" + termList.get(0));
//                    } else {
//                        query.setQuery("TEXT:" + termList.get(i) + " AND " + "TEXT:" + termList.get(i + 1));
//                    }
//                    query.setFields("DOCNO","HEAD");
//                    QueryResponse response = client.query(query);
//                    SolrDocumentList results = response.getResults();
//                    for (SolrDocument doc : results) {
//                        Object test = doc.getFieldValue("DOCNO");
//                        test.toString();
//                        System.out.println(test);
////                        String docIDandTitle = (String) doc.getFieldValue("DOCNO") + (String) doc.getFieldValue("HEAD");
////                        if (!resultsMap.containsKey(docIDandTitle)) {
////                            resultsMap.put(docIDandTitle, 1);
////                        } else {
////                            resultsMap.put(docIDandTitle, resultsMap.get(docIDandTitle) + 1);
////                        }
//                    }
//                }
//
//                // sort the map descending
//                entriesSortedByValues(resultsMap);
//
//                // return the top 50 results for this query
//                int counter = 0;
//                for (Map.Entry<String, Integer> entry : resultsMap.entrySet()) {
//                    printWriter.println(entry.getKey());
//                    counter++;
//                    if (counter == 49) {
//                        break;
//                    }
//                }

                // DOCUMENTS PORTION
                // map that will hold our comparative results
                Map<String, Integer> resultsMap = new HashMap<>();

                // loop through the words to search for
                for (String term : queryTerm) {
                    if (term.equals(" ") || term.equals("")) { // skip any white space or empty string
                        continue;
                    }
//                    System.out.println("term: " + term);
                    SolrQuery query = new SolrQuery(); // create the query object

                    // search for the word
                    query.setQuery("TEXT:" + term);
                    query.setFields("DOCNO","HEAD");
                    QueryResponse response = client.query(query);
                    SolrDocumentList results = response.getResults();
                    for (SolrDocument doc : results) {
                        Object docno = doc.getFieldValue("DOCNO");
                        ArrayList<String> docnoList = (ArrayList<String>) docno;
                        Object head = doc.getFieldValue("HEAD");
                        ArrayList<String> headList = (ArrayList<String>) head;
                        String article = docnoList.toArray()[0] + " " + headList.toArray()[0];
                        // add this title to the map
                        resultsMap.put(article, resultsMap.get(article) == null ? 1 : resultsMap.get(article)+ 1);
                    }
                }

                // sort the map descending
//                entriesSortedByValues(resultsMap);

                // iterate through and return the top 50
                int counter = 0;
                for (Map.Entry<String, Integer> entry : resultsMap.entrySet()) {
                    if (counter == 49) { // only want top 50 results
                        break;
                    }
                    if (entry.getValue() > 3) { // setting a threshold based on how many documents were intersected in our search
                        printWriter.println(entry.getKey() + entry.getValue());
                        System.out.println(entry.getKey() + " ocurrences: " + entry.getValue()); // term selected to query on
                        counter++;
                    }
                }

            } // reading query file
        } // try for buffered ready query file
    }
}
