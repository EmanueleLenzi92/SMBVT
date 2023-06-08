# The Story Map Building and Visualization Tool (SMBVT)

Project collaborators: Valentina Bartalesi, Nicolò Pratelli, Emanuele Lenzi

Developers: Emanuele Lenzi, Daniele Metilli (for the previous NBVT)

The Story Map Building and Visualization Tool (SMBVT) is semi-automatic tool to construct and visualise narratives, intended as semantic networks of events related to each other through semantic relations, in form of story maps and timeline. The tool was developed as an extension of a previously developed tool called Narrative Building and Visualisation Tool (NBVT - http://dlnarratives.eu/tool/index.html). SMBVT, like NBVT does, obeys an [ontology for narratives](https://dlnarratives.eu/ontology.html) we developed.


If you use ``SMBVT`` as support to your research consider citing:

> Meghini C., Bartalesi V., Metilli D. _[Representing narratives in digital libraries: The narrative ontology](https://content.iospress.com/articles/semantic-web/sw200421)_. In: Semantic Web, vol. 12, no. 2, pp. 241-264, 2021.
> 
> Metilli D., Bartalesi V., Meghini C. _[A Wikidata-based tool for building and visualising narratives](https://link.springer.com/article/10.1007/s00799-019-00266-3)_. In: International Journal on Digital Libraries, vol. Springer, 2019.
> 
> Metilli D., Bartalesi V., Meghini C. _[Populating narratives using Wikidata events: an initial experiment](https://link.springer.com/chapter/10.1007/978-3-030-11226-4_13)_. In: Digital Libraries: Supporting Open Science. 15th Italian Research Conference on Digital Libraries, pp. 159 - 166. Manghi P., Candela L., Silvello G. (eds.). (Communications in Computer and Information Science, vol. 988). Pisa: Springer, 2019.

# Dependencies
To use ``SMBVT``, the following software is needed:
- [PostgreSQL](https://www.postgresql.org/)
- [Apache Jena Fuseki](https://jena.apache.org/documentation/fuseki2/)
- If you want to install the system on your machine, you have to install software like XAMPP that provides the Apache web server and the latest versions of PHP 

# Configuration and Installation
After installing PostgreSQL, you must create a database and import the two tables contained in the SQL folder. The config file to update your connection data is try/PgConn.php. 

After installing Apache Jena Fuseki, you need to create a dataset called "narratives" and the public endpoint "narratives/query".

In the end, you can use an FTP client (such as Filezilla) to upload all the files on your server or in the folder htdocs, if you are using XAMPP on your machine.
