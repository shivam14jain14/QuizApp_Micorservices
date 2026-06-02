package shivam.example.MicroserviceQuestionQuizApp.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseObj {
    private int quesId;
    private String response;

    public int getQuesId() {
        return quesId;
    }

    public String getResponse() {
        return response;
    }
}
