import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.common.SolrInputDocument;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

public class Indexer {

    /**
     * Function parses the dreddit ata into Solr
     * @param directory the directory that the AP data is contained in
     * @return number of documents that were added
     * @throws IOException error from the buffered reader
     * @throws SolrServerException error from connecting to Solr
     */
    private static int SolrjPopulator(File directory) throws IOException, SolrServerException {
        HttpSolrClient client = new HttpSolrClient.Builder("http://localhost:8983/solr/reddit").build();

        // PARSING THE DOCUMENTS COLLECTION
        File[] contents = directory.listFiles();

        // create list for documents to be sent to Solr
        List<SolrInputDocument> inputDocuments = new ArrayList<>();

        // check for null
        if (contents != null) {

            // open a document
            for (File file : contents) {

                // read through document
                try (BufferedReader br = new BufferedReader(new FileReader(file))) {

                    // initializing variables for while loop
                    String subreddit = ""; // current subreddit variable
                    String author = ""; // current author variable
                    String url = ""; // current first variable
                    String title = ""; // current second variable
                    String selftext = ""; // current head variable
                    int score = 0; // current byline document
                    int num_comments = 0; // current dateline document
                    int gilded = 0; // current text document

                    JSONParser parser = new JSONParser();

                    // iterate through the document line by line
                    for (String line = br.readLine(); line != null; line = br.readLine()) {

                        Object obj;
                        try {
                            obj = parser.parse(line);
                            JSONObject jsonObject = (JSONObject) obj;

                            // get various items from the JSON line
                            subreddit = (String) jsonObject.get("subreddit");
                            author = (String) jsonObject.get("author");
                            url = (String) jsonObject.get("url");
                            title = (String) jsonObject.get("title");
                            selftext = (String) jsonObject.get("selftext");
                            score = (int) jsonObject.get("score");
                            num_comments = (int) jsonObject.get("num_comment");
                            gilded = (int) jsonObject.get("gilded");
                        } catch (Exception e) {
                            e.printStackTrace();
                        }

                        // create a Solr document
                        SolrInputDocument doc = new SolrInputDocument();
                        doc.addField("subreddit", subreddit);
                        doc.addField("author", author);
                        doc.addField("url", url);
                        doc.addField("title", title);
                        doc.addField("selftext", selftext);
                        doc.addField("score", score);
                        doc.addField("num_comments", num_comments);
                        doc.addField("gilded", gilded);

                        // add document to a List that Solr will parse
                        inputDocuments.add(doc);
                        System.out.println("Added a document: " + title + " to the list. Contains text: \n" + selftext);

                    }

                    // adding documents to Solr
                    for (SolrInputDocument doc : inputDocuments) {
                        client.add(doc);
                        client.commit();
                    }

                } catch (Exception e) {
                    System.out.println("Error: " + e);
                }

            }
        }

        return inputDocuments.size();
    }

}
