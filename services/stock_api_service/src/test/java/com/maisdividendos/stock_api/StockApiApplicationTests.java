import io.restassured.RestAssured;
import org.junit.jupiter.api.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

class StockEndpointTest {

	@Test
	void testGetStockBBAS3_StatusCode() {
		String baseUrl = "http://ec2-3-93-178-200.compute-1.amazonaws.com:8080/api/stock/BBAS3";

		int statusCode = RestAssured.get(baseUrl).getStatusCode();
		assertThat(statusCode, is(200));
	}
}
